import { useState, type ChangeEvent, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const Workbench = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRebuildMode, setIsRebuildMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load existing photos when the component mounts
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: stages } = await supabase
      .from('job_stages')
      .select('image_url')
      .eq('user_id', user.id)
      .order('stage_index', { ascending: true });

    if (stages) {
      const urls = await Promise.all(
        stages.map(async (s) => {
          const { data } = await supabase.storage.from('workbench').createSignedUrl(s.image_url, 3600);
          return data?.signedUrl || '';
        })
      );
      setPhotos(urls.filter(u => u !== ''));
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Please log in!"); setLoading(false); return; }

    // 1. Upload to user-specific folder
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('workbench')
      .upload(filePath, file);

    if (uploadError) { console.error(uploadError); setLoading(false); return; }

    // 2. Save to Database
    await supabase.from('job_stages').insert([
      { job_id: 'default-job', stage_index: photos.length, image_url: filePath, user_id: user.id }
    ]);

    // 3. Get Signed URL to display
    const { data } = await supabase.storage.from('workbench').createSignedUrl(filePath, 3600);
    
    if (data?.signedUrl) {
      setPhotos((prev) => [...prev, data.signedUrl]);
      setActiveIndex(photos.length);
    }
    setLoading(false);
  };

  const displaySequence = isRebuildMode ? [...photos].reverse() : photos;
  const currentPhoto = displaySequence[activeIndex];

  return (
    <div className="workbench-container">
      <nav className="workbench-sidebar">
        <h3>Control Panel</h3>
        <button onClick={() => { setIsRebuildMode(!isRebuildMode); setActiveIndex(0); }}>
          {isRebuildMode ? 'Stop Rebuild (1-10)' : 'Start Rebuild (10-1)'}
        </button>
        <div className="status-box">
          <p>Stage: {activeIndex + 1} / {photos.length}</p>
        </div>
      </nav>

      <main className="viewport-canvas">
        <div className="drop-zone" onClick={() => document.getElementById('fileInput')?.click()}>
          {loading ? <p>Uploading...</p> : currentPhoto ? (
            <img src={currentPhoto} alt="Stage" className="active-photo" />
          ) : (
            <p>Click to add stage photo</p>
          )}
          <input type="file" id="fileInput" hidden onChange={handleFileUpload} />
        </div>

        <div className="toolbar">
          <button onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}>Previous</button>
          <button onClick={() => setActiveIndex(Math.min(displaySequence.length - 1, activeIndex + 1))}>Next</button>
        </div>
      </main>
    </div>
  );
};

export default Workbench;