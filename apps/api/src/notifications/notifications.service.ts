import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly sendgridApiKey: string | undefined;
  private readonly senderEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.sendgridApiKey = this.config.get<string>('SENDGRID_API_KEY');
    this.senderEmail = this.config.get<string>('SENDGRID_SENDER_EMAIL') ?? 'noreply@nexusflow.ai';
  }

  isConfigured(): boolean {
    return !!this.sendgridApiKey;
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      senderEmail: this.senderEmail,
    };
  }

  private async sendEmail(payload: EmailPayload): Promise<boolean> {
    if (!this.sendgridApiKey) {
      this.logger.warn(`Email not sent (SendGrid not configured): ${payload.subject} -> ${payload.to}`);
      return false;
    }

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: this.senderEmail, name: 'NexusFlow AI' },
        subject: payload.subject,
        content: [{ type: 'text/html', value: payload.html }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`SendGrid error ${res.status}: ${text}`);
      return false;
    }

    this.logger.log(`Email sent: ${payload.subject} -> ${payload.to}`);
    return true;
  }

  async sendRfqEmail(
    organizationId: string,
    supplierId: string,
    data: { products: { name: string; quantity: number }[]; notes?: string },
  ) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, organizationId },
    });
    if (!supplier?.email) {
      return { sent: false, message: 'Supplier has no email address' };
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const itemRows = data.products
      .map((p) => `<tr><td style="padding:8px;border:1px solid #ddd">${p.name}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${p.quantity}</td></tr>`)
      .join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1e3a5f;padding:20px;color:white;text-align:center">
          <h1 style="margin:0">NexusFlow AI</h1>
          <p style="margin:4px 0 0">Request for Quotation</p>
        </div>
        <div style="padding:20px;background:#f9fafb">
          <p>Dear ${supplier.name},</p>
          <p>${org?.name ?? 'Our organization'} would like to request a quotation for the following items:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead><tr style="background:#e5e7eb">
              <th style="padding:8px;border:1px solid #ddd;text-align:left">Product</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:center">Quantity</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          <p>Please reply with your best pricing and delivery timeline.</p>
          <p>Best regards,<br>${org?.name ?? 'NexusFlow AI'}</p>
        </div>
        <div style="padding:12px;text-align:center;color:#6b7280;font-size:12px">
          Sent via NexusFlow AI Supply Chain Platform
        </div>
      </div>
    `;

    const sent = await this.sendEmail({
      to: supplier.email,
      subject: `RFQ from ${org?.name ?? 'NexusFlow AI'}`,
      html,
    });

    return {
      sent,
      message: sent
        ? `RFQ email sent to ${supplier.email}`
        : this.isConfigured()
          ? 'Failed to send email'
          : `Email queued (SendGrid not configured). Would send to: ${supplier.email}`,
      preview: html,
    };
  }

  async sendOrderConfirmation(organizationId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, organizationId },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });

    if (!order) return { sent: false, message: 'Order not found' };
    if (!order.supplier?.email) {
      return { sent: false, message: 'Supplier has no email address' };
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const itemRows = order.items
      .map(
        (i) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ddd">${i.product.name}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center">${i.quantity}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">$${i.unitPrice.toFixed(2)}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">$${(i.quantity * i.unitPrice).toFixed(2)}</td>
          </tr>`,
      )
      .join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1e3a5f;padding:20px;color:white;text-align:center">
          <h1 style="margin:0">NexusFlow AI</h1>
          <p style="margin:4px 0 0">Purchase Order Confirmation</p>
        </div>
        <div style="padding:20px;background:#f9fafb">
          <p>Dear ${order.supplier.name},</p>
          <p>This confirms purchase order <strong>${order.orderNumber}</strong>:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead><tr style="background:#e5e7eb">
              <th style="padding:8px;border:1px solid #ddd;text-align:left">Product</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:center">Qty</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right">Unit Price</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right">Total</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
            <tfoot><tr style="background:#e5e7eb;font-weight:bold">
              <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right">Total:</td>
              <td style="padding:8px;border:1px solid #ddd;text-align:right">$${order.totalAmount.toFixed(2)}</td>
            </tr></tfoot>
          </table>
          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          <p>Best regards,<br>${org?.name ?? 'NexusFlow AI'}</p>
        </div>
      </div>
    `;

    const sent = await this.sendEmail({
      to: order.supplier.email,
      subject: `PO Confirmation: ${order.orderNumber}`,
      html,
    });

    return {
      sent,
      message: sent
        ? `Confirmation sent to ${order.supplier.email}`
        : this.isConfigured()
          ? 'Failed to send email'
          : `Email queued (SendGrid not configured). Would send to: ${order.supplier.email}`,
      preview: html,
    };
  }

  async sendPaymentReminder(organizationId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, organizationId },
      include: { supplier: true },
    });

    if (!order) return { sent: false, message: 'Order not found' };
    if (!order.supplier?.email) {
      return { sent: false, message: 'Supplier has no email address' };
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1e3a5f;padding:20px;color:white;text-align:center">
          <h1 style="margin:0">NexusFlow AI</h1>
          <p style="margin:4px 0 0">Payment Reminder</p>
        </div>
        <div style="padding:20px;background:#f9fafb">
          <p>Dear ${order.supplier.name},</p>
          <p>This is a reminder regarding purchase order <strong>${order.orderNumber}</strong> with a total of <strong>$${order.totalAmount.toFixed(2)}</strong>.</p>
          <p>Current status: <strong>${order.status}</strong></p>
          <p>Please ensure payment arrangements are in order. Contact us if you have any questions.</p>
          <p>Best regards,<br>${org?.name ?? 'NexusFlow AI'}</p>
        </div>
      </div>
    `;

    const sent = await this.sendEmail({
      to: order.supplier.email,
      subject: `Payment Reminder: ${order.orderNumber}`,
      html,
    });

    return {
      sent,
      message: sent
        ? `Reminder sent to ${order.supplier.email}`
        : this.isConfigured()
          ? 'Failed to send email'
          : `Email queued (SendGrid not configured). Would send to: ${order.supplier.email}`,
      preview: html,
    };
  }

  getTemplates() {
    return [
      {
        id: 'rfq',
        name: 'Request for Quotation',
        description: 'Send RFQ to suppliers with product list and quantities',
        requiredFields: ['supplierId', 'products'],
      },
      {
        id: 'order_confirmation',
        name: 'Order Confirmation',
        description: 'Confirm a purchase order to the supplier',
        requiredFields: ['orderId'],
      },
      {
        id: 'payment_reminder',
        name: 'Payment Reminder',
        description: 'Send payment reminder for a purchase order',
        requiredFields: ['orderId'],
      },
    ];
  }
}
