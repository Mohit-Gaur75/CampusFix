import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeta } from '../../api/meta';
import { suggestCategory, checkDuplicates, createIssue } from '../../api/issues';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge, PriorityPill } from '../../components/ui/Badges';
import { useToast } from '../../components/ui/Toast';
import { Upload, X, MapPin, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const ReportIssue = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [meta, setMeta] = useState(null);
  
  // Form State
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [locationId, setLocationId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [duplicates, setDuplicates] = useState([]);
  const [linkedIssueId, setLinkedIssueId] = useState(null);
  const [outcome, setOutcome] = useState(null); // success screen

  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedDescription = useDebounce(description, 1000);

  useEffect(() => {
    getMeta().then(res => setMeta(res.data)).catch(console.error);
  }, []);

  // Category Auto-suggest
  useEffect(() => {
    if (debouncedDescription.length >= 10 && !category) {
      suggestCategory(debouncedDescription).then(res => {
        if (res.data.category && res.data.category !== 'OTHER') {
          setSuggestedCategory(res.data.category);
        }
      }).catch(() => {});
    }
  }, [debouncedDescription, category]);

  // Duplicate Check
  useEffect(() => {
    if (debouncedDescription.length >= 10 && locationId && category) {
      checkDuplicates({
        description: debouncedDescription,
        category,
        locationId
      }).then(res => {
        setDuplicates(res.data || []);
      }).catch(() => {});
    } else {
      setDuplicates([]);
    }
  }, [debouncedDescription, locationId, category]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size <= 5 * 1024 * 1024);
    
    if (valid.length < files.length) {
      addToast({ type: 'error', message: 'Some files were rejected. Only JPG/PNG/WEBP under 5MB are allowed.' });
    }
    
    setPhotos(prev => [...prev, ...valid].slice(0, 3));
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e, forceLink = null) => {
    e?.preventDefault();
    if (!locationId || !category || description.length < 10) {
      addToast({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    const targetLink = forceLink || linkedIssueId;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('locationId', locationId);
      formData.append('category', category);
      formData.append('description', description);
      if (targetLink) formData.append('linkToIssueId', targetLink);
      
      photos.forEach(p => formData.append('photos', p));

      const res = await createIssue(formData);
      setOutcome(res.data);
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.error?.message || 'Failed to submit issue' });
      setIsSubmitting(false);
    }
  };

  if (outcome) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {outcome.outcome === 'LINKED' ? 'Issue Linked' : 'Issue Reported'}
        </h1>
        <p className="text-slate-600 mb-8 text-lg">
          {outcome.outcome === 'LINKED' 
            ? `Your report has been grouped with ${outcome.issue.code}. ${outcome.issue.reportCount} students are affected.`
            : 'Thank you for reporting this issue. The relevant department has been notified.'}
        </p>
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 inline-block text-left w-full max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
              {outcome.issue.code}
            </span>
            <StatusBadge status={outcome.issue.status} />
            <PriorityPill level={outcome.issue.priority.level} />
          </div>
          <h3 className="font-medium text-slate-900 mt-3">{outcome.issue.title}</h3>
        </div>
        <div>
          <Button onClick={() => navigate(`/student/issues/${outcome.issue._id}`)}>
            Track Issue
          </Button>
          <Button variant="ghost" onClick={() => navigate('/student/dashboard')} className="ml-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Derived location dropdowns
  const buildings = meta ? [...new Set(meta.locations.map(l => l.building))] : [];
  const floors = building && meta ? [...new Set(meta.locations.filter(l => l.building === building).map(l => l.floor))] : [];
  const rooms = floor && meta ? meta.locations.filter(l => l.building === building && l.floor === floor) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
        <p className="text-slate-500 mt-1">Help us keep the campus in top shape.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Location */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 h-6 w-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
            Where is it?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Building</label>
              <select 
                className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={building}
                onChange={e => { setBuilding(e.target.value); setFloor(''); setLocationId(''); }}
                required
              >
                <option value="">Select Building...</option>
                {buildings.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Floor</label>
              <select 
                className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-50"
                value={floor}
                onChange={e => { setFloor(e.target.value); setLocationId(''); }}
                disabled={!building}
                required
              >
                <option value="">Select Floor...</option>
                {floors.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specific Location</label>
              <select 
                className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-50"
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                disabled={!floor}
                required
              >
                <option value="">Select Room/Area...</option>
                
                {rooms.map(r => <option key={r._id} value={r._id}>{r.area || r.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Step 2: Description & Category */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 h-6 w-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
            What's the problem?
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                rows="4"
                className="w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                minLength={10}
                maxLength={500}
              />
              <div className="text-right text-xs text-slate-400 mt-1">
                {description.length}/500 chars
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  className="w-full sm:w-1/2 border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={category}
                  onChange={e => { setCategory(e.target.value); setSuggestedCategory(''); }}
                  required
                >
                  <option value="">Select Category...</option>
                  {meta?.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                {suggestedCategory && !category && (
                  <button
                    type="button"
                    onClick={() => { setCategory(suggestedCategory); setSuggestedCategory(''); }}
                    className="inline-flex items-center px-3 py-2 border border-indigo-200 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                    Looks like {suggestedCategory}?
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Duplicates Alert */}
        {duplicates.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-amber-500 mt-0.5 mr-3 shrink-0" />
              <div className="w-full">
                <h3 className="text-md font-semibold text-amber-800">Similar issues found</h3>
                <p className="text-sm text-amber-700 mt-1 mb-4">
                  Check if someone else already reported this. If so, linking your report helps us prioritize it faster!
                </p>
                <div className="space-y-3">
                  {duplicates.map(dup => (
                    <Card key={dup.issue._id} className="bg-white border-amber-200 overflow-hidden">
                      <div className="p-4 sm:flex sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-amber-700">{dup.issue.code}</span>
                            <StatusBadge status={dup.issue.status} />
                          </div>
                          <p className="text-sm font-medium text-slate-900 truncate">{dup.issue.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{dup.issue.reportCount} students affected • Match: {Math.round(dup.score * 100)}%</p>
                        </div>
                        <div className="mt-4 sm:mt-0 shrink-0">
                          <Button 
                            type="button" 
                            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white border-none"
                            onClick={(e) => handleSubmit(e, dup.issue._id)}
                            disabled={isSubmitting}
                          >
                            Yes, this is it
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Photos */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 h-6 w-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
            Photos <span className="text-slate-400 font-normal ml-2">(Optional)</span>
          </h2>
          <p className="text-sm text-slate-500 mb-4 ml-8">Add up to 3 photos (max 5MB each) to help the team identify the problem.</p>
          
          <div className="ml-8">
            {photos.length < 3 && (
              <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="text-sm text-slate-600">
                    <span className="relative font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                      Upload a file
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                </div>
                <input type="file" className="sr-only" multiple accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} />
              </label>
            )}

            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative h-24 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={URL.createObjectURL(photo)} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting || duplicates.length > 0} className="px-8 text-lg py-3">
            {isSubmitting ? 'Submitting...' : 'Submit Issue'}
          </Button>
        </div>
      </form>
    </div>
  );
};
