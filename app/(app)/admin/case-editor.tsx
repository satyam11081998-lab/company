'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function CaseEditor() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [skillNode, setSkillNode] = useState('');
  const [skillCluster, setSkillCluster] = useState('');
  const [firm, setFirm] = useState('');
  const [round, setRound] = useState('');
  const [estMinutes, setEstMinutes] = useState(25);
  const [pointsReward, setPointsReward] = useState(85);
  const [mcqExplainer, setMcqExplainer] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cases')
      .select('id, title, type, skill_node, skill_cluster, interview_meta, mcq')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setCases(data);
    setLoading(false);
  };

  const selectCase = (c: any) => {
    setSelectedCase(c);
    setSkillNode(c.skill_node || '');
    setSkillCluster(c.skill_cluster || '');
    const meta = c.interview_meta || {};
    setFirm(meta.firm || '');
    setRound(meta.round || '');
    setEstMinutes(meta.est_minutes || 25);
    setPointsReward(meta.points_reward || 85);
    const mcq = c.mcq || {};
    setMcqExplainer(mcq.explainer || '');
  };

  const handleSave = async () => {
    if (!selectedCase) return;
    setSaving(true);
    
    const interview_meta = {
      firm,
      round,
      est_minutes: estMinutes,
      points_reward: pointsReward
    };
    
    // We only update explainer here for simplicity, options would need a full array editor
    const mcq = {
      ...selectedCase.mcq,
      explainer: mcqExplainer
    };

    const { error } = await supabase
      .from('cases')
      .update({
        skill_node: skillNode || null,
        skill_cluster: skillCluster || null,
        interview_meta,
        mcq
      })
      .eq('id', selectedCase.id);

    if (!error) {
      alert('Saved successfully!');
      fetchCases();
    } else {
      alert('Error saving: ' + error.message);
    }
    setSaving(false);
  };

  return (
    <Card className="p-6 border-border bg-card shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Case Metadata Editor (Phase 4)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-r pr-6 max-h-[500px] overflow-y-auto">
          <h3 className="font-medium text-sm mb-2 text-muted-foreground">Recent Cases</h3>
          {loading ? <p>Loading...</p> : (
            <div className="flex flex-col gap-2">
              {cases.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => selectCase(c)}
                  className={`text-left p-2 rounded text-sm ${selectedCase?.id === c.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                >
                  <div className="truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.type} {c.skill_node ? `· ${c.skill_node}` : ''}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          {selectedCase ? (
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg">{selectedCase.title}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Skill Node</label>
                  <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={skillNode} onChange={e => setSkillNode(e.target.value)} placeholder="e.g. p4" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Skill Cluster</label>
                  <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={skillCluster} onChange={e => setSkillCluster(e.target.value)} placeholder="e.g. prof" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Firm (Interview Meta)</label>
                  <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={firm} onChange={e => setFirm(e.target.value)} placeholder="e.g. BCG" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Round (Interview Meta)</label>
                  <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={round} onChange={e => setRound(e.target.value)} placeholder="e.g. Partner Round" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Est Minutes</label>
                  <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={estMinutes} onChange={e => setEstMinutes(Number(e.target.value))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Points Reward</label>
                  <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={pointsReward} onChange={e => setPointsReward(Number(e.target.value))} />
                </div>
              </div>
              
              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs font-medium text-muted-foreground">MCQ Explainer</label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={mcqExplainer} onChange={e => setMcqExplainer(e.target.value)} />
              </div>
              
              <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl">
              Select a case to edit metadata
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
