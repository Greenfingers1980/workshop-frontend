import React, { useState } from 'react';
import { recordAssetAcquisition } from '../../services/accountingService';
import './Tools.css';

interface Tool {
  id: string;
  name: string;
  department: 'Watch Workshop' | 'Clock Workshop' | 'Library';
  location: string;
  cost: number;
  condition: 'Excellent' | 'Good' | 'Needing Work';
  notes: string;
  paymentMethod: 'Bank' | 'Directors Loan';
  imageUrl: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
}

export default function Tools() {
  const [activeTab, setActiveTab] = useState('view');
  const [tools, setTools] = useState<Tool[]>([]);
  const [serviceRequired, setServiceRequired] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    department: 'Watch Workshop' as const,
    location: '',
    cost: 0,
    condition: 'Good' as const,
    notes: '',
    paymentMethod: 'Bank' as const,
    imageUrl: '',
    lastServiceDate: '',
    nextServiceDate: ''
  });

  const formatGold = (value: number) => 
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
      .format(value).replace('£', '') + ' Gold';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData({ ...formData, imageUrl: url });
    }
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTool: Tool = { 
      id: `TL-${Date.now()}`, 
      ...formData,
      lastServiceDate: serviceRequired ? formData.lastServiceDate : undefined,
      nextServiceDate: serviceRequired ? formData.nextServiceDate : undefined
    };

    await recordAssetAcquisition(newTool);
    setTools([...tools, newTool]);
    setFormData({ name: '', department: 'Watch Workshop', location: '', cost: 0, condition: 'Good', notes: '', paymentMethod: 'Bank', imageUrl: '', lastServiceDate: '', nextServiceDate: '' });
    setActiveTab('view');
  };

  return (
    <div className="tools-container">
      <div className="parchment-card">
        <h1 className="tools-title">Workshop Asset Ledger</h1>
        <div className="tabs-row">
          <button onClick={() => setActiveTab('view')} className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}>📜 View Ledger</button>
          <button onClick={() => setActiveTab('add')} className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}>➕ Record New Tool</button>
        </div>

        {activeTab === 'view' && (
          <ul className="tools-list">
            {tools.map((tool) => (
              <li key={tool.id} className="tool-item">
                {tool.imageUrl && <img src={tool.imageUrl} alt={tool.name} style={{ width: '50px', height: '50px', borderRadius: '4px' }} />}
                <div><strong>{tool.name}</strong> ({tool.department})</div>
                <div className="tool-cost">Value: {formatGold(tool.cost)}</div>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'add' && (
          <form className="add-tool-form" onSubmit={handleAddTool}>
            <div className="form-row">
              <input className="form-field" placeholder="Tool Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <select className="form-field" onChange={(e) => setFormData({...formData, department: e.target.value as any})}>
                <option>Watch Workshop</option><option>Clock Workshop</option><option>Library</option>
              </select>
            </div>
            
            <div className="form-row">
              <select className="form-field" onChange={(e) => setFormData({...formData, condition: e.target.value as any})}>
                <option>Excellent</option><option>Good</option><option>Needing Work</option>
              </select>
              <input type="number" min="0" className="form-field" placeholder="Value (Gold)" required onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})} />
            </div>

            <div className="form-row">
              <select className="form-field" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}>
                <option value="Bank">Purchase via Bank</option>
                <option value="Directors Loan">Directors Investment</option>
              </select>
              <input type="file" className="form-field" accept="image/*" capture="environment" onChange={handleImageUpload} />
            </div>

            <div className="form-row">
              <label style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
                <input type="checkbox" checked={!serviceRequired} onChange={() => setServiceRequired(!serviceRequired)} />
                Not Applicable (No Service)
              </label>
            </div>

            <div className="form-row">
              <input type="date" className="form-field" disabled={!serviceRequired} onChange={(e) => setFormData({...formData, lastServiceDate: e.target.value})} />
              <input type="date" className="form-field" disabled={!serviceRequired} onChange={(e) => setFormData({...formData, nextServiceDate: e.target.value})} />
            </div>

            <textarea className="form-field" rows={3} placeholder="Detailed Notes..." onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            
            <button type="submit" className="tab-button active">Save to Ledger & Assets</button>
          </form>
        )}
      </div>
    </div>
  );
}