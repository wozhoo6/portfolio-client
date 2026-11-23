'use client'

import { useId, useState, type FormEvent } from 'react'
import type { AdminApi } from '@/lib/admin-api'
import { ApiError } from '@/lib/api'
import type { AdminProject, ProjectPayload } from '@/lib/types'
import { useBrokenImage } from '@/lib/useBrokenImage'

export type ProjectFormValues = {
  title: string
  summary: string
  description: string
  role: string
  type: string
  problem: string
  solution: string
  keyFeatures: string
  techStack: string
  repoUrl: string
  liveUrl: string
  thumbnailUrl: string
  links: { label: string; url: string }[]
  isFeatured: boolean
  isPublished: boolean
}

type FieldName =
  | 'title'
  | 'summary'
  | 'description'
  | 'role'
  | 'type'
  | 'problem'
  | 'solution'
  | 'keyFeatures'
  | 'techStack'
  | 'repoUrl'
  | 'liveUrl'
  | 'thumbnailUrl'
  | 'links'
type FormErrors = Partial<Record<FieldName | 'form', string>>

const SERVER_FIELD: Record<string, FieldName> = {
  title: 'title',
  summary: 'summary',
  description: 'description',
  role: 'role',
  type: 'type',
  problem: 'problem',
  solution: 'solution',
  key_features: 'keyFeatures',
  tech_stack: 'techStack',
  repo_url: 'repoUrl',
  live_url: 'liveUrl',
  thumbnail_url: 'thumbnailUrl',
  links: 'links',
}

const lines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const orNull = (text: string) => text.trim() || null

function isHttpUrl(text: string): boolean {
  try {
    const { protocol } = new URL(text)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export function toPayload(values: ProjectFormValues): ProjectPayload {
  return {
    title: values.title.trim(),
    summary: values.summary.trim(),
    description: orNull(values.description),
    role: orNull(values.role),
    type: orNull(values.type),
    problem: orNull(values.problem),
    solution: orNull(values.solution),
    key_features: lines(values.keyFeatures),
    tech_stack: lines(values.techStack),
    repo_url: orNull(values.repoUrl),
    live_url: orNull(values.liveUrl),
    thumbnail_url: orNull(values.thumbnailUrl),
    links: values.links
      .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
      .filter((link) => link.label || link.url),
    is_featured: values.isFeatured,
  }
}

export function fromProject(project: AdminProject | null): ProjectFormValues {
  return {
    title: project?.title ?? '',
    summary: project?.summary ?? '',
    description: project?.description ?? '',
    role: project?.role ?? '',
    type: project?.type ?? '',
    problem: project?.problem ?? '',
    solution: project?.solution ?? '',
    keyFeatures: (project?.key_features ?? []).join('\n'),
    techStack: (project?.tech_stack ?? []).join('\n'),
    repoUrl: project?.repo_url ?? '',
    liveUrl: project?.live_url ?? '',
    thumbnailUrl: project?.thumbnail_url ?? '',
    links: (project?.links ?? []).map((link) => ({ ...link })),
    isFeatured: project?.is_featured ?? false,
    isPublished: project?.is_published ?? false,
  }
}

function validate(values: ProjectFormValues): FormErrors {
  const errors: FormErrors = {}
  const payload = toPayload(values)

  if (!payload.title) errors.title = 'Title is required.'
  else if (payload.title.length > 255) errors.title = 'Title is 255 characters at most.'

  if (!payload.summary) errors.summary = 'Summary is required.'
  else if (payload.summary.length > 255) errors.summary = 'Summary is 255 characters at most.'

  if ((payload.type ?? '').length > 60) errors.type = 'Type is 60 characters at most.'

  if (payload.key_features.length > 10) errors.keyFeatures = 'At most 10 key features.'
  else if (payload.key_features.some((line) => line.length > 255)) errors.keyFeatures = 'Each key feature is 255 characters at most.'

  if (payload.tech_stack.some((line) => line.length > 50)) errors.techStack = 'Each tech item is 50 characters at most.'

  if (payload.repo_url && !isHttpUrl(payload.repo_url)) errors.repoUrl = 'Enter a full link starting with http:// or https://.'
  if (payload.live_url && !isHttpUrl(payload.live_url)) errors.liveUrl = 'Enter a full link starting with http:// or https://.'
  if (payload.thumbnail_url && !isHttpUrl(payload.thumbnail_url)) {
    errors.thumbnailUrl = 'Enter a full link starting with http:// or https://.'
  }

  if (payload.links.length > 20) errors.links = 'At most 20 related links.'
  else if (payload.links.some((link) => !link.label || !link.url)) errors.links = 'Each related link needs a label and a link.'
  else if (payload.links.some((link) => link.label.length > 60)) errors.links = 'Link labels are 60 characters at most.'
  else if (payload.links.some((link) => !isHttpUrl(link.url))) errors.links = 'Related links must start with http:// or https://.'

  return errors
}

function mapServerErrors(errors: Record<string, string[]>): FormErrors {
  const mapped: FormErrors = {}
  for (const [key, messages] of Object.entries(errors)) {
    const name = SERVER_FIELD[key.split('.')[0]]
    const slot = name ?? 'form'
    mapped[slot] ??= messages[0]
  }
  return mapped
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none'
const buttonPrimary =
  'rounded-lg border-b-[3px] border-[#6D3FD1] bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60'
const buttonGhost =
  'rounded-lg border border-link/50 px-4 py-2 text-sm font-semibold text-link transition-colors hover:bg-link/10 disabled:opacity-60'

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  rows?: number
  required?: boolean
  maxLength?: number
  placeholder?: string
}

function Field({ id, label, value, onChange, error, hint, rows, required, maxLength, placeholder }: FieldProps) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  const shared = {
    id,
    value,
    maxLength,
    placeholder,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    className: inputClass,
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      {rows ? (
        <textarea {...shared} rows={rows} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input {...shared} type="text" onChange={(event) => onChange(event.target.value)} />
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

function ThumbPreview({ url }: { url: string }) {
  const { ref, broken, onError } = useBrokenImage()
  return broken ? (
    <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-card text-xs text-muted">Can&apos;t load image</div>
  ) : (
    // A plain img: the link can point anywhere, and onError swaps in the placeholder.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={url} alt="Thumbnail preview" onError={onError} className="h-24 w-40 rounded-lg object-cover" />
  )
}

type ProjectFormProps = {
  api: AdminApi
  project: AdminProject | null
  onSaved: (project: AdminProject) => void
  onCancel: () => void
}

export function ProjectForm({ api, project, onSaved, onCancel }: ProjectFormProps) {
  const id = useId()
  const [values, setValues] = useState<ProjectFormValues>(() => fromProject(project))
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  const renamed = project !== null && values.title.trim() !== project.title
  const thumbnail = values.thumbnailUrl.trim()

  function setLink(index: number, key: 'label' | 'url', value: string) {
    set(
      'links',
      values.links.map((link, i) => (i === index ? { ...link, [key]: value } : link)),
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving) return

    const found = validate(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    setSaving(true)
    setErrors({})
    try {
      const payload = toPayload(values)
      if (project) {
        const { title, ...rest } = payload
        // Sending the title makes the API rebuild the slug, so only send it when it changed.
        onSaved(await api.updateProject(project.id, title === project.title ? rest : payload))
      } else {
        onSaved(await api.createProject({ ...payload, is_published: values.isPublished }))
      }
    } catch (error) {
      setErrors(
        error instanceof ApiError && error.status === 422 && error.errors
          ? mapServerErrors(error.errors)
          : { form: "Couldn't save the project. Try again." },
      )
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="flex max-w-3xl flex-col gap-5">
      <button type="button" onClick={onCancel} className="self-start text-sm font-semibold text-link hover:underline">
        ← Back to projects
      </button>
      <h3 className="font-heading text-xl font-semibold">{project ? `Edit ${project.title}` : 'New project'}</h3>

      <Field id={`${id}-title`} label="Title" required maxLength={255} value={values.title} onChange={(v) => set('title', v)} error={errors.title} />
      {renamed && project && (
        <p className="-mt-3 text-sm text-amber-400">
          Renaming changes this project&apos;s web address (now /projects/{project.slug}). Old shared links will stop working.
        </p>
      )}
      <Field id={`${id}-summary`} label="Summary" required maxLength={255} value={values.summary} onChange={(v) => set('summary', v)} error={errors.summary} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-type`} label="Type" maxLength={60} placeholder="Freelance, Final Thesis…" value={values.type} onChange={(v) => set('type', v)} error={errors.type} />
        <Field id={`${id}-role`} label="Role" value={values.role} onChange={(v) => set('role', v)} error={errors.role} />
      </div>
      <Field id={`${id}-description`} label="Description" rows={4} value={values.description} onChange={(v) => set('description', v)} error={errors.description} />
      <Field id={`${id}-problem`} label="Problem" rows={3} value={values.problem} onChange={(v) => set('problem', v)} error={errors.problem} />
      <Field id={`${id}-solution`} label="Solution" rows={3} value={values.solution} onChange={(v) => set('solution', v)} error={errors.solution} />
      <Field id={`${id}-features`} label="Key features" rows={4} hint="One per line, up to 10." value={values.keyFeatures} onChange={(v) => set('keyFeatures', v)} error={errors.keyFeatures} />
      <Field id={`${id}-stack`} label="Tech stack" rows={3} hint="One per line." value={values.techStack} onChange={(v) => set('techStack', v)} error={errors.techStack} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-repo`} label="Repo link" placeholder="https://github.com/…" value={values.repoUrl} onChange={(v) => set('repoUrl', v)} error={errors.repoUrl} />
        <Field id={`${id}-live`} label="Live demo link" placeholder="https://…" value={values.liveUrl} onChange={(v) => set('liveUrl', v)} error={errors.liveUrl} />
      </div>

      <div className="flex flex-col gap-3">
        <Field id={`${id}-thumb`} label="Thumbnail link" placeholder="https://…/image.jpg" hint="Paste a link to an image." value={values.thumbnailUrl} onChange={(v) => set('thumbnailUrl', v)} error={errors.thumbnailUrl} />
        {thumbnail && isHttpUrl(thumbnail) && <ThumbPreview key={thumbnail} url={thumbnail} />}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Related links</legend>
        {values.links.map((link, index) => (
          <div key={index} className="flex flex-wrap gap-2">
            <input
              aria-label={`Link ${index + 1} label`}
              placeholder="Label"
              maxLength={60}
              value={link.label}
              onChange={(event) => setLink(index, 'label', event.target.value)}
              className={`${inputClass} sm:w-48`}
            />
            <input
              aria-label={`Link ${index + 1} address`}
              placeholder="https://…"
              value={link.url}
              onChange={(event) => setLink(index, 'url', event.target.value)}
              className={`${inputClass} min-w-48 flex-1`}
            />
            <button
              type="button"
              onClick={() => set('links', values.links.filter((_, i) => i !== index))}
              className={buttonGhost}
            >
              Remove
            </button>
          </div>
        ))}
        {errors.links && (
          <p role="alert" className="text-sm text-red-400">
            {errors.links}
          </p>
        )}
        <button
          type="button"
          onClick={() => set('links', [...values.links, { label: '', url: '' }])}
          disabled={values.links.length >= 20}
          className={`${buttonGhost} self-start`}
        >
          Add link
        </button>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.isFeatured}
          onChange={(event) => set('isFeatured', event.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        Featured (shown as the large card)
      </label>
      {!project && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isPublished}
            onChange={(event) => set('isPublished', event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Published (off keeps it as a draft; you can activate it later)
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className={buttonGhost}>
          Cancel
        </button>
        {errors.form && (
          <p role="alert" className="text-sm text-red-400">
            {errors.form}
          </p>
        )}
      </div>
    </form>
  )
}
