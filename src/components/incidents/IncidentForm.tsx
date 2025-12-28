import { useState } from 'react';
import { motion } from 'framer-motion';
import LocationPickerModal from '../LocationPickerModal';

import { 
  Flame, Car, Heart, CloudLightning, Wrench,
  MapPin, Camera, Send, Loader2, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIncidentStore, IncidentType, IncidentSeverity } from '@/store/incidentStore';
import { toast } from 'sonner';

const incidentTypes: { value: IncidentType; label: string; icon: React.ReactNode }[] = [
  { value: 'accident', label: 'Accident', icon: <Car className="w-5 h-5" /> },
  { value: 'fire', label: 'Fire', icon: <Flame className="w-5 h-5" /> },
  { value: 'medical', label: 'Medical', icon: <Heart className="w-5 h-5" /> },
  { value: 'disaster', label: 'Natural Disaster', icon: <CloudLightning className="w-5 h-5" /> },
  { value: 'infrastructure', label: 'Infrastructure', icon: <Wrench className="w-5 h-5" /> },
];

const severityLevels: { value: IncidentSeverity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30' },
  { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' },
];

export default function IncidentForm() {
  const addIncident = useIncidentStore((state) => state.addIncident);
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.006, address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [uploadingImage, setUploadingImage] = useState(false);

const handleImageSelect = (file: File) => {
  if (!file.type.startsWith("image/")) {
    toast.error("Only images allowed");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Max image size is 5MB");
    return;
  }

  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) {
      toast.error('Please select an incident type');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (!location.address.trim()) {
      toast.error('Please provide a location');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    addIncident({
      type: selectedType,
      description,
      location,
      severity,
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    
    toast.success('Incident reported successfully!');
    
    // Reset form after animation
    setTimeout(() => {
      setSelectedType(null);
      setDescription('');
      setLocation({ lat: 40.7128, lng: -74.006, address: '' });
      setSeverity('medium');
      setIsSuccess(false);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-12 rounded-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-success" />
        </motion.div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          Report Submitted!
        </h3>
        <p className="text-muted-foreground">
          Thank you for helping keep our community safe.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-card p-8 rounded-2xl space-y-8"
    >
      {/* Incident Type Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-4 font-display tracking-wide uppercase">
          Incident Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {incidentTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSelectedType(type.value)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                selectedType === type.value
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
                  : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {type.icon}
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-4 font-display tracking-wide uppercase">
          Severity Level
        </label>
        <div className="flex gap-3">
          {severityLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setSeverity(level.value)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold text-sm transition-all duration-300 ${level.color} ${
                severity === level.value
                  ? level.value === 'low' ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-background' :
                    level.value === 'medium' ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background' :
                    'ring-2 ring-red-500 ring-offset-2 ring-offset-background'
                  : 'opacity-60'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-4 font-display tracking-wide uppercase">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the incident in detail..."
          rows={4}
          className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-4 font-display tracking-wide uppercase">
          Location
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
  type="text"
  value={location.address}
  readOnly
  placeholder="Select location from map"
 className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
/>

          </div>
          <Button
  type="button"
  variant="outline"
  onClick={() => setOpenMap(true)}
  className="gap-2"
>
  <MapPin className="w-4 h-4" />
  Detect
</Button>

        </div>
      </div>

      {openMap && (
  <LocationPickerModal
    onClose={() => setOpenMap(false)}
    onSelect={(lat, lng, address) => {
      setLocation({ lat, lng, address });
      toast.success('Location selected successfully');
    }}
  />
)}


      {/* Image Upload (placeholder) */}
      {/* <div>
        <label className="block text-sm font-medium text-foreground mb-4 font-display tracking-wide uppercase">
          Photo Evidence (Optional)
        </label>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
        </div>
      </div> */}
      <div>
  <label className="block text-sm font-medium mb-4 uppercase">
    Photo Evidence (Optional)
  </label>

  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      handleImageSelect(e.dataTransfer.files[0]);
    }}
    className="relative border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition"
  >
    {!imagePreview ? (
      <label className="cursor-pointer">
        <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Click to upload or drag & drop
        </p>

        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) =>
            e.target.files && handleImageSelect(e.target.files[0])
          }
        />
      </label>
    ) : (
      <>
        <img
          src={imagePreview}
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-black/40 rounded-xl" />

        <button
          type="button"
          onClick={() => {
            setImageFile(null);
            setImagePreview(null);
          }}
          className="absolute top-3 right-3 bg-red-500 px-3 py-1 text-xs rounded-full text-white"
        >
          Remove
        </button>
      </>
    )}
  </div>
</div>


      {/* Submit */}
      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting Report...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Incident Report
          </>
        )}
      </Button>
    </motion.form>
  );
}