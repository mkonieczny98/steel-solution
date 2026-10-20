'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send, CheckCircle2, Paperclip, X } from 'lucide-react'
import { contactSchema, MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS_BYTES, type ContactInput } from '@/lib/contact'
import { trackConversion } from '@/components/public/conversion-tracker'
import { cn } from '@/lib/utils'
import { buttonClass } from '@/components/public/button-styles'

const fieldClass =
  'block w-full border border-input bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ink focus:ring-1 focus:ring-ink aria-[invalid=true]:border-destructive'

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block font-display text-sm font-bold uppercase tracking-wider">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

export function QuoteForm({
  categories,
  brands,
  defaultCategory,
  defaultVehicle,
  project,
  contact,
}: {
  categories: string[]
  brands: string[]
  defaultCategory?: string
  project?: { slug: string; title: string }
  defaultVehicle?: string
  contact: { name: string; phone: string; phoneHref: string }
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [serverError, setServerError] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const requestId = useRef<string | null>(null)
  const started = useRef(false)
  const sending = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { category: defaultCategory || '', vehicle: defaultVehicle || '' },
  })

  const onSubmit = async (data: ContactInput) => {
    if (sending.current || fileError) return
    sending.current = true
    requestId.current ||= crypto.randomUUID()
    setStatus('sending')
    setServerError('')
    try {
      const payload = new FormData()
      payload.set('data', JSON.stringify({ ...data, requestId: requestId.current, projectSlug: project?.slug }))
      files.forEach((file) => payload.append('attachments', file))
      const res = await fetch('/api/contact', { method: 'POST', body: payload })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        if (json.issues) Object.entries(json.issues).forEach(([name, messages]) => {
          if (Array.isArray(messages) && messages[0]) setError(name as keyof ContactInput, { message: String(messages[0]) })
        })
        throw new Error(json.error || 'Nie udało się wysłać wiadomości.')
      }
      setStatus('success')
      reset({ category: defaultCategory || '', vehicle: defaultVehicle || '' })
      setFiles([])
      requestId.current = null
      started.current = false
    } catch (error) {
      trackConversion('quote_error')
      setStatus('error')
      setServerError(error instanceof Error ? error.message : 'Nie udało się wysłać wiadomości.')
    } finally { sending.current = false }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
        <CheckCircle2 className="h-16 w-16 text-primary" />
        <h2 className="heading-display mt-6 text-4xl">Dziękujemy!</h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          Zapytanie zostało zapisane. Sprawdzimy zakres prac i skontaktujemy się, aby omówić szczegóły, wycenę i możliwy termin.
        </p>
        <button type="button" onClick={() => setStatus('idle')} className={cn(buttonClass('outline-dark'), 'mt-8')}>
          Wyślij kolejne zapytanie
        </button>
      </div>
    )
  }

  const errorProps = (name: keyof ContactInput) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit, () => trackConversion('quote_error'))} onFocusCapture={() => { if (!started.current) { started.current = true; trackConversion('quote_start') } }} noValidate aria-busy={status === 'sending'} className="grid gap-5 sm:grid-cols-2">
      {project && <p className="border-l-2 border-primary bg-muted/50 p-3 text-sm sm:col-span-2">Zapytanie o podobną zabudowę: <strong>{project.title}</strong></p>}
      <Field label="Imię i nazwisko" htmlFor="name" required error={errors.name?.message}>
        <input id="name" autoComplete="name" className={fieldClass} placeholder="Jan Kowalski" {...register('name')} {...errorProps('name')} />
      </Field>
      <Field label="E-mail" htmlFor="email" required error={errors.email?.message}>
        <input id="email" type="email" autoComplete="email" className={fieldClass} placeholder="jan@example.com" {...register('email')} {...errorProps('email')} />
      </Field>
      <Field label="Jednostka / firma" htmlFor="organization">
        <input id="organization" autoComplete="organization" className={fieldClass} placeholder="np. OSP Betkowo" {...register('organization')} />
      </Field>
      <Field label="Telefon" htmlFor="phone" error={errors.phone?.message} hint="Oddzwonimy, jeśli wolisz rozmowę">
        <input id="phone" type="tel" autoComplete="tel" className={fieldClass} placeholder="+48 600 000 000" {...register('phone')} {...errorProps('phone')} />
      </Field>
      <Field label="Pojazd" htmlFor="vehicle" hint="Marka, model i rok, np. MAN TGM 2021">
        <input id="vehicle" list="vehicle-brands" className={fieldClass} placeholder="np. Scania P280" {...register('vehicle')} />
        <datalist id="vehicle-brands">
          {brands.map((brand) => (
            <option key={brand} value={brand} />
          ))}
        </datalist>
      </Field>
      <Field label="Czego potrzebujesz?" htmlFor="category">
        <select id="category" className={cn(fieldClass, 'appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10')} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...register('category')}>
          <option value="">Wybierz rodzaj zabudowy</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value="Inne / nietypowe">Inne / nietypowe</option>
        </select>
      </Field>
      <Field label="Opis zapotrzebowania" htmlFor="message" required error={errors.message?.message} className="sm:col-span-2">
        <textarea
          id="message"
          rows={4}
          className={cn(fieldClass, 'resize-y')}
          placeholder="Np. potrzebujemy półki do kabiny MAN TGM na latarki i rękawice dla 6 osób. Napisz, co ma się zmienić i jaki sprzęt chcesz przewozić."
          {...register('message')}
          {...errorProps('message')}
        />
      </Field>

      <div className="sm:col-span-2">
        <label htmlFor="attachments" className="mb-2 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider"><Paperclip className="h-4 w-4" /> Zdjęcia lub dokumentacja <span className="font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground">opcjonalnie</span></label>
        <input ref={fileInput} id="attachments" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" aria-describedby="attachment-help attachment-error" disabled={status === 'sending'} className="block w-full rounded-none border border-dashed bg-muted/30 p-3 text-sm file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-white" onChange={(event) => {
          const chosen = [...files, ...Array.from(event.target.files || [])]
          event.target.value = ''
          if (chosen.length > MAX_ATTACHMENTS) return setFileError('Maksymalnie 3 pliki. Usuń jeden, aby dodać kolejny.')
          if (chosen.some(file => file.size > MAX_ATTACHMENT_BYTES || file.size === 0)) return setFileError('Każdy plik musi mieć od 1 bajta do 5 MB.')
          if (chosen.reduce((sum, file) => sum + file.size, 0) > MAX_ATTACHMENTS_BYTES) return setFileError('Łącznie możesz dodać do 10 MB.')
          if (chosen.some(file => !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type))) return setFileError('Wybierz pliki JPG, PNG, WebP lub PDF.')
          setFiles(chosen)
          setFileError('')
        }} />
        <p id="attachment-help" className="mt-2 text-xs leading-relaxed text-muted-foreground">Do 3 plików: JPG, PNG, WebP lub PDF. Maks. 5 MB na plik, łącznie 10 MB. Zdjęcia kabiny, skrytek i szkice wystarczą.</p>
        <p id="attachment-error" role="alert" className="mt-2 text-sm text-destructive">{fileError}{fileError && <button type="button" className="ml-2 underline" onClick={() => setFileError('')}>Pomiń ten plik</button>}</p>
        {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center gap-3 border bg-background px-3 py-2 text-sm"><span className="min-w-0 flex-1 break-all">{file.name} <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span></span><button type="button" disabled={status === 'sending'} onClick={() => { setFiles(files.filter((_, i) => i !== index)); setFileError('') }} aria-label={`Usuń plik ${file.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center"><X className="h-4 w-4" /></button></li>)}</ul>}
      </div>

      {/* Pole-pułapka na boty */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Nie wypełniaj tego pola</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="sm:col-span-2">
        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--primary))]"
            {...register('consent')}
            {...errorProps('consent')}
          />
          <span>
            Wyrażam zgodę na przetwarzanie moich danych osobowych przez {contact.name} w celu odpowiedzi na zapytanie i
            przygotowania oferty. Więcej w{' '}
            <Link href="/polityka-prywatnosci" className="text-foreground underline underline-offset-2 hover:text-primary">
              polityce prywatności
            </Link>
            . <span className="text-primary">*</span>
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" role="alert" className="mt-1.5 text-sm text-destructive">
            {errors.consent.message}
          </p>
        )}
      </div>

      {status === 'error' && (
        <p role="alert" className="border-l-4 border-destructive bg-destructive/10 px-4 py-3 text-sm sm:col-span-2">
          {serverError} Możesz też zadzwonić:{' '}
          <a href={contact.phoneHref} className="font-semibold underline">
            {contact.phone}
          </a>
        </p>
      )}

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="text-primary">*</span> pola wymagane
        </p>
        <button type="submit" disabled={status === 'sending'} className={cn(buttonClass('primary', 'lg'), 'disabled:opacity-60')}>
          {status === 'sending' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Wysyłanie…
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Wyślij zapytanie
            </>
          )}
        </button>
      </div>
    </form>
  )
}
