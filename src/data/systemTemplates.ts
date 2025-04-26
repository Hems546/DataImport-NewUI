
type TemplateField = {
  name: string;
  type: 'string' | 'number' | 'date' | 'email' | 'phone' | 'boolean';
  required: boolean;
  description: string;
};

type SystemTemplate = {
  title: string;
  description: string;
  fields: TemplateField[];
};

export const systemTemplates: SystemTemplate[] = [
  {
    title: "Contacts",
    description: "Import contact information for customers, leads, or team members",
    fields: [
      { name: "firstName", type: "string", required: true, description: "Contact's first name" },
      { name: "lastName", type: "string", required: true, description: "Contact's last name" },
      { name: "email", type: "email", required: true, description: "Primary email address" },
      { name: "phone", type: "phone", required: false, description: "Contact phone number" },
      { name: "company", type: "string", required: false, description: "Company or organization" },
      { name: "title", type: "string", required: false, description: "Job title or position" },
      { name: "department", type: "string", required: false, description: "Department or team" },
      { name: "address", type: "string", required: false, description: "Physical address" },
      { name: "city", type: "string", required: false, description: "City" },
      { name: "state", type: "string", required: false, description: "State or province" },
      { name: "country", type: "string", required: false, description: "Country" },
      { name: "zipCode", type: "string", required: false, description: "ZIP or postal code" },
      { name: "isActive", type: "boolean", required: false, description: "Contact status" },
      { name: "notes", type: "string", required: false, description: "Additional notes" }
    ]
  },
  {
    title: "Orders",
    description: "Import order and transaction data",
    fields: [
      { name: "orderNumber", type: "string", required: true, description: "Unique order identifier" },
      { name: "orderDate", type: "date", required: true, description: "Date of order" },
      { name: "customerName", type: "string", required: true, description: "Customer's full name" },
      { name: "customerEmail", type: "email", required: true, description: "Customer's email" },
      { name: "totalAmount", type: "number", required: true, description: "Order total amount" },
      { name: "paymentStatus", type: "string", required: true, description: "Payment status" },
      { name: "paymentMethod", type: "string", required: false, description: "Method of payment" },
      { name: "currency", type: "string", required: false, description: "Currency code" },
      { name: "shippingAddress", type: "string", required: false, description: "Shipping address" },
      { name: "billingAddress", type: "string", required: false, description: "Billing address" },
      { name: "shippingMethod", type: "string", required: false, description: "Shipping method" },
      { name: "trackingNumber", type: "string", required: false, description: "Tracking number" },
      { name: "notes", type: "string", required: false, description: "Order notes" },
      { name: "status", type: "string", required: false, description: "Order status" },
      { name: "items", type: "string", required: false, description: "Order items (JSON)" }
    ]
  },
  {
    title: "Subscribers",
    description: "Import newsletter or service subscribers",
    fields: [
      { name: "email", type: "email", required: true, description: "Subscriber's email address" },
      { name: "subscriptionDate", type: "date", required: true, description: "Date of subscription" },
      { name: "status", type: "string", required: true, description: "Subscription status" },
      { name: "firstName", type: "string", required: false, description: "First name" },
      { name: "lastName", type: "string", required: false, description: "Last name" },
      { name: "preferences", type: "string", required: false, description: "Content preferences" },
      { name: "source", type: "string", required: false, description: "Subscription source" },
      { name: "timezone", type: "string", required: false, description: "Subscriber's timezone" },
      { name: "lastEmailDate", type: "date", required: false, description: "Last email received" },
      { name: "tags", type: "string", required: false, description: "Subscriber tags" },
      { name: "optInDate", type: "date", required: false, description: "Opt-in confirmation date" },
      { name: "unsubscribeDate", type: "date", required: false, description: "Unsubscribe date" }
    ]
  },
  {
    title: "Subscriptions",
    description: "Import subscription service or membership data",
    fields: [
      { name: "subscriptionId", type: "string", required: true, description: "Unique subscription ID" },
      { name: "customerId", type: "string", required: true, description: "Customer identifier" },
      { name: "planName", type: "string", required: true, description: "Subscription plan name" },
      { name: "startDate", type: "date", required: true, description: "Start date" },
      { name: "status", type: "string", required: true, description: "Subscription status" },
      { name: "billingFrequency", type: "string", required: true, description: "Billing frequency" },
      { name: "amount", type: "number", required: true, description: "Subscription amount" },
      { name: "currency", type: "string", required: false, description: "Currency code" },
      { name: "nextBillingDate", type: "date", required: false, description: "Next billing date" },
      { name: "lastBillingDate", type: "date", required: false, description: "Last billing date" },
      { name: "paymentMethod", type: "string", required: false, description: "Payment method" },
      { name: "cancelDate", type: "date", required: false, description: "Cancellation date" },
      { name: "notes", type: "string", required: false, description: "Additional notes" },
      { name: "discounts", type: "string", required: false, description: "Applied discounts" },
      { name: "features", type: "string", required: false, description: "Included features" },
      { name: "autoRenew", type: "boolean", required: false, description: "Auto-renewal status" }
    ]
  },
  {
    title: "Custom",
    description: "Create a custom import template",
    fields: []
  }
];
