import { z } from 'zod'

// Wspólny schemat formularza – walidowany w przeglądarce i ponownie na serwerze.
export const contactSchema = z.object({
  requestId: z.string().uuid().optional(),
  projectSlug: z.string().max(200).regex(/^[a-z0-9-]*$/).optional(),
  name: z.string().trim().min(2, 'Podaj imię i nazwisko').max(120),
  email: z.string().trim().email('Nieprawidłowy adres e-mail').max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()-]*$/, 'Nieprawidłowy numer telefonu')
    .optional()
    .or(z.literal('')),
  organization: z.string().trim().max(200).optional().or(z.literal('')),
  vehicle: z.string().trim().max(200).optional().or(z.literal('')),
  category: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Wiadomość musi mieć co najmniej 10 znaków').max(5000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Zgoda jest wymagana do wysłania zapytania' }) }),
  // Pole-pułapka na boty – ukryte dla ludzi, musi zostać puste
  website: z.string().max(0).optional().or(z.literal('')),
})

export type ContactInput = z.infer<typeof contactSchema>

export const MAX_ATTACHMENTS = 3
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
export const MAX_ATTACHMENTS_BYTES = 10 * 1024 * 1024
export const LEAD_STATUSES = { new: 'Nowa', contact: 'Kontakt', offer: 'Oferta wysłana', won: 'Wygrana', closed: 'Zamknięta' } as const
export const NOTIFICATION_STATUSES: Record<string, string> = { pending: 'Oczekuje', sending: 'Wysyłanie', sent: 'Wysłano', failed: 'Błąd wysyłki', not_configured: 'Skonfiguruj pocztę SMTP' }
