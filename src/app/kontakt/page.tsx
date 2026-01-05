'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import { PublicHeader } from '@/components/public/header'
import { PublicFooter } from '@/components/public/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Imię i nazwisko jest wymagane'),
  email: z.string().email('Nieprawidłowy adres email'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Wiadomość musi mieć co najmniej 10 znaków'),
})

type ContactForm = z.infer<typeof contactSchema>

export default function KontaktPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error()

      setIsSuccess(true)
      reset()
      toast({
        title: 'Wiadomość wysłana!',
        description: 'Skontaktujemy się z Tobą wkrótce.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się wysłać wiadomości. Spróbuj ponownie.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      value: '+48 690 418 119',
      href: 'tel:+48123456789',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'kontakt@steelsolution.pl',
      href: 'mailto:kontakt@steelsolution.pl',
    },
    {
      icon: MapPin,
      title: 'Adres',
      value: 'Leśna 12, 64-020 Betkowo',
      href: 'https://maps.google.com',
    },
  ]

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen">
        {/* Header */}
        <section className="border-b bg-muted/30 py-12">
          <div className="container">
            <h1 className="text-3xl font-bold md:text-4xl">Kontakt</h1>
            <p className="mt-2 text-muted-foreground">
              Skontaktuj się z nami, aby uzyskać wycenę
            </p>
          </div>
        </section>

        {/* Contact section */}
        <section className="py-12">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Contact info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Dane kontaktowe</h2>
                  <p className="mt-2 text-muted-foreground">
                    Jesteśmy do Twojej dyspozycji. Zadzwoń, napisz lub odwiedź nas.
                  </p>
                </div>

                {contactInfo.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    className="flex items-start gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </a>
                ))}

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Godziny otwarcia</h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>Poniedziałek - Piątek: 8:00 - 17:00</p>
                      <p>Sobota: 9:00 - 14:00</p>
                      <p>Niedziela: Zamknięte</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    {isSuccess ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="mt-4 text-xl font-semibold">
                          Wiadomość wysłana!
                        </h3>
                        <p className="mt-2 text-muted-foreground">
                          Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setIsSuccess(false)}
                        >
                          Wyślij kolejną wiadomość
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold">
                          Wyślij wiadomość
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Wypełnij formularz, a skontaktujemy się z Tobą jak najszybciej
                        </p>

                        <form
                          onSubmit={handleSubmit(onSubmit)}
                          className="mt-6 space-y-4"
                        >
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Imię i nazwisko *</Label>
                              <Input
                                id="name"
                                placeholder="Jan Kowalski"
                                {...register('name')}
                              />
                              {errors.name && (
                                <p className="text-sm text-destructive">
                                  {errors.name.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="jan@example.com"
                                {...register('email')}
                              />
                              {errors.email && (
                                <p className="text-sm text-destructive">
                                  {errors.email.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="phone">Telefon</Label>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+48 123 456 789"
                                {...register('phone')}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="subject">Temat</Label>
                              <Input
                                id="subject"
                                placeholder="Zapytanie o wycenę"
                                {...register('subject')}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Wiadomość *</Label>
                            <Textarea
                              id="message"
                              rows={6}
                              placeholder="Opisz swoje potrzeby..."
                              {...register('message')}
                            />
                            {errors.message && (
                              <p className="text-sm text-destructive">
                                {errors.message.message}
                              </p>
                            )}
                          </div>

                          <Button
                            type="submit"
                            size="lg"
                            className="w-full sm:w-auto"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Wysyłanie...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Wyślij wiadomość
                              </>
                            )}
                          </Button>
                        </form>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  )
}
