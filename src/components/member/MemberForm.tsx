import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Camera, Loader2, Link as LinkIcon } from 'lucide-react';
import { uploadToCloudinary, isCloudinaryConfigured } from '../../lib/cloudinary';
import { useUIStore } from '../../stores/uiStore';

export interface MemberFormValues {
  name: string;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  dob?: string;
  dod?: string;
  phone?: string;
  photoUrl?: string;
  profession?: string;
  location?: string;
  bio?: string;
}

interface FieldProps {
  label: string;
  name: keyof MemberFormValues;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, name, type = 'text', placeholder, required }: FieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<MemberFormValues>();

  const error = errors[name];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--color-warm-gray)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label} {required && <span style={{ color: 'var(--color-amber-glow)' }}>*</span>}
      </label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="vaerline-input"
        style={error ? { borderColor: '#F87171' } : {}}
      />
      {error && (
        <span style={{ fontSize: 11, color: '#F87171' }}>
          {error.message as string}
        </span>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: keyof MemberFormValues;
  options: { value: string; label: string }[];
  required?: boolean;
}

function SelectField({ label, name, options, required }: SelectFieldProps) {
  const { register, formState: { errors } } = useFormContext<MemberFormValues>();
  const error = errors[name];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--color-warm-gray)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label} {required && <span style={{ color: 'var(--color-amber-glow)' }}>*</span>}
      </label>
      <select
        {...register(name)}
        className="vaerline-input"
        style={error ? { borderColor: '#F87171' } : {}}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: '#1E262F', color: '#FAF7F2' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: 11, color: '#F87171' }}>
          {error.message as string}
        </span>
      )}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  name: keyof MemberFormValues;
  placeholder?: string;
  rows?: number;
}

function TextAreaField({ label, name, placeholder, rows = 3 }: TextAreaFieldProps) {
  const { register } = useFormContext<MemberFormValues>();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--color-warm-gray)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      <textarea
        {...register(name)}
        placeholder={placeholder}
        rows={rows}
        className="vaerline-input"
        style={{ resize: 'vertical', minHeight: 80 }}
      />
    </div>
  );
}

/**
 * Image upload field — tries Cloudinary first, falls back to manual URL input.
 */
function ImageUploadField() {
  const { register, setValue, watch } = useFormContext<MemberFormValues>();
  const addToast = useUIStore(s => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const currentUrl = watch('photoUrl') ?? '';
  const cloudinaryReady = isCloudinaryConfigured();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image must be under 10 MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      setValue('photoUrl', result.secureUrl, { shouldValidate: true });
      addToast('Photo uploaded!', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Member Photo
      </label>

      {/* Preview + actions row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Avatar preview */}
        <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--surface-2)', flexShrink: 0, background: 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentUrl ? (
            <img src={currentUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <Camera size={20} color="var(--text-muted)" />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, width: 'fit-content' }}
          >
            {isUploading ? (
              <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /><span>Uploading…</span></>
            ) : (
              <><Camera size={13} /><span>{cloudinaryReady ? 'Upload Photo' : 'Upload Photo (Cloudinary needed)'}</span></>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

          {/* Toggle URL input */}
          <button
            type="button"
            onClick={() => setShowUrlInput(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content' }}
          >
            <LinkIcon size={11} />
            {showUrlInput ? 'Hide URL input' : 'Paste image URL instead'}
          </button>
        </div>
      </div>

      {/* URL input (shown on toggle) */}
      {showUrlInput && (
        <input
          {...register('photoUrl')}
          type="url"
          placeholder="https://example.com/photo.jpg"
          className="vaerline-input"
          style={{ fontSize: 13 }}
        />
      )}

      {currentUrl && !isUploading && (
        <button
          type="button"
          onClick={() => setValue('photoUrl', '', { shouldValidate: false })}
          style={{ fontSize: 11, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: 'fit-content' }}
        >
          ✕ Remove photo
        </button>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function MemberForm() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Name */}
      <Field label="Full Name" name="name" placeholder="e.g. Arjun Sharma" required />

      {/* Gender */}
      <SelectField
        label="Gender"
        name="gender"
        options={[
          { value: 'unspecified', label: 'Prefer not to say' },
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ]}
      />

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Date of Birth" name="dob" type="date" />
        <Field label="Date of Death" name="dod" type="date" />
      </div>

      {/* Phone Number (WhatsApp Enabled) */}
      <Field label="WhatsApp / Phone Number" name="phone" placeholder="+91 98765 43210" />

      {/* Profession & Location */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Profession" name="profession" placeholder="e.g. Doctor" />
        <Field label="Location" name="location" placeholder="e.g. Mumbai" />
      </div>

      {/* Photo — Cloudinary upload + URL fallback */}
      <ImageUploadField />

      {/* Bio */}
      <TextAreaField label="Bio & Memory Notes" name="bio" placeholder="A short heirloom note about this person…" />
    </div>
  );
}

export { Field, SelectField, TextAreaField };
