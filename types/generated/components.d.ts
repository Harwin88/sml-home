import type { Schema, Struct } from '@strapi/strapi';

export interface SupportTicketResponse extends Struct.ComponentSchema {
  collectionName: 'components_support_ticket_responses';
  info: {
    description: 'Respuesta individual en un ticket de soporte';
    displayName: 'Respuesta de Ticket';
    icon: 'message';
  };
  attributes: {
    attachments: Schema.Attribute.Media<'images' | 'files', true>;
    isCustomerResponse: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    isInternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    message: Schema.Attribute.Text & Schema.Attribute.Required;
    respondedBy: Schema.Attribute.String & Schema.Attribute.Required;
    respondedByEmail: Schema.Attribute.Email & Schema.Attribute.Required;
    responseTime: Schema.Attribute.DateTime;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'support.ticket-response': SupportTicketResponse;
    }
  }
}
