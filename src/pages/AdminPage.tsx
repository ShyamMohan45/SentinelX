import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Shield, Users, Activity, Clock, 
  CheckCircle2, AlertTriangle, Loader2, XCircle,
  StickyNote, ChevronDown, ChevronUp
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useIncidentStore, Incident, IncidentStatus } from '@/store/incidentStore';
import { formatDistanceToNow } from 'date-fns';

const statusOptions: { value: IncidentStatus; label: string; color: string }[] = [
  { value: 'unverified', label: 'Unverified', color: 'bg-red-500' },
  { value: 'verified', label: 'Verified', color: 'bg-primary' },
  { value: 'responding', label: 'Responding', color: 'bg-yellow-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
];


function AdminIncidentRow({ incident }: { incident: Incident }) {
  const { updateIncidentStatus, addNote } = useIncidentStore();
  const [expanded, setExpanded] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: IncidentStatus) => {
    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateIncidentStatus(incident.id, status);
    setIsUpdating(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote(incident.id, newNote);
      setNewNote('');
    }
  };

  const statusIcon = {
    unverified: <XCircle className="w-4 h-4" />,
    verified: <CheckCircle2 className="w-4 h-4" />,
    responding: <Loader2 className="w-4 h-4 animate-spin" />,
    resolved: <CheckCircle2 className="w-4 h-4" />,
  };

  const severityColor = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Main Row */}
      <div className="p-4 flex items-center gap-4">
        {/* Priority Indicator */}
        <div className={`w-2 h-12 rounded-full ${
          incident.severity === 'high' ? 'bg-red-500' :
          incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-semibold text-foreground capitalize">
              {incident.type}
            </span>
            <span className={`text-xs font-medium uppercase ${severityColor[incident.severity]}`}>
              {incident.severity}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{incident.location.address}</p>
        </div>

        {/* Votes */}
        <div className="text-center px-4">
          <div className="text-lg font-display font-bold text-foreground">{incident.votes}</div>
          <div className="text-xs text-muted-foreground">votes</div>
        </div>

        {/* Time */}
        <div className="text-right px-4 hidden md:block">
          <div className="text-sm text-foreground">
            {formatDistanceToNow(incident.reportedAt, { addSuffix: true })}
          </div>
          <div className="text-xs text-muted-foreground">reported</div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              disabled={isUpdating}
              className={`p-2 rounded-lg transition-all ${
                incident.status === status.value
                  ? `${status.color} text-white shadow-lg`
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
              title={status.label}
            >
              {statusIcon[status.value]}
            </button>
          ))}
        </div>

        {/* Expand */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-border p-4 bg-secondary/30"
        >
          <div className="grid md:grid-cols-2 gap-4">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{incident.description}</p>
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Internal Notes
              </h4>
              <div className="space-y-2 mb-3">
                {incident.notes && incident.notes.length > 0 ? (
                  incident.notes.map((note, i) => (
                    <div key={i} className="text-sm text-muted-foreground bg-background/50 p-2 rounded">
                      {note}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No notes yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button size="sm" onClick={handleAddNote}>Add</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AdminPage() {
  const incidents = useIncidentStore((state) => state.incidents);
  
const incidentsByStatusData = [
  { name: 'Unverified', value: incidents.filter(i => i.status === 'unverified').length, color: '#ef4444' },
  { name: 'Responding', value: incidents.filter(i => i.status === 'responding').length, color: '#f59e0b' },
  { name: 'Resolved', value: incidents.filter(i => i.status === 'resolved').length, color: '#22c55e' },
];


const incidentsByTypeData = [
  'Fire',
  'Medical',
  'Accident',
  'Disaster',
  'Infrastructure',
].map((type) => ({
  type,
  count: incidents.filter(
    (incident) => incident.type.toLowerCase() === type.toLowerCase()
  ).length,
}));


{/* Incidents by Status */}
<div className="mt-8 rounded-xl border border-border bg-background p-6">
  <h2 className="text-lg font-semibold">Incidents by Status</h2>
  <p className="mb-4 text-sm text-muted-foreground">
    Current distribution of incident resolution states
  </p>

</div>

  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'votes'>('priority');

  // Sort incidents
  const sortedIncidents = [...incidents].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.severity] - priorityOrder[b.severity];
    } else if (sortBy === 'time') {
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    } else {
      return b.votes - a.votes;
    }
  });

  // Stats
  const activeCount = incidents.filter((i) => i.status !== 'resolved').length;
  const respondingCount = incidents.filter((i) => i.status === 'responding').length;
  const resolvedToday = incidents.filter((i) => 
    i.status === 'resolved' && 
    new Date(i.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      <Navbar />

      <main className="relative pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="font-display text-4xl font-bold text-foreground">
                Admin <span className="text-primary text-glow">Panel</span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              Incident management and response coordination
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="text-sm text-muted-foreground">Active Incidents</span>
              </div>
              <div className="text-3xl font-display font-bold text-foreground">{activeCount}</div>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 text-warning animate-spin" />
                <span className="text-sm text-muted-foreground">Responding</span>
              </div>
              <div className="text-3xl font-display font-bold text-foreground">{respondingCount}</div>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-sm text-muted-foreground">Resolved Today</span>
              </div>
              <div className="text-3xl font-display font-bold text-foreground">{resolvedToday}</div>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Responders Online</span>
              </div>
              <div className="text-3xl font-display font-bold text-foreground">247</div>
            </div>
          </motion.div>


{/* Admin Analytics */}
<div className="mt-8 rounded-xl border border-border bg-background p-6">
  <h2 className="text-lg font-semibold">Incidents by Type</h2>
<p className="mb-4 text-sm text-muted-foreground">
  Distribution of reported incidents across categories
</p>

  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={incidentsByTypeData}>
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
          {/* Sort Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-2">
              {[
                { value: 'priority', label: 'Priority', icon: <AlertTriangle className="w-4 h-4" /> },
                { value: 'time', label: 'Time', icon: <Clock className="w-4 h-4" /> },
                { value: 'votes', label: 'Votes', icon: <Activity className="w-4 h-4" /> },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className="gap-2"
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Incidents List */}
          <div className="space-y-3">
            {sortedIncidents.map((incident) => (
              <AdminIncidentRow key={incident.id} incident={incident} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}