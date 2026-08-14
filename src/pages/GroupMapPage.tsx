import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Map as MapIcon, Compass, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GroupMap } from '../components/map/GroupMap';
import { AddPlaceModal } from '../components/places/AddPlaceModal';

export const GroupMapPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, places, setCurrentGroupId } = useApp();

  const group = groups.find((g) => g.id === groupId) || groups[0];
  const groupPlaces = places.filter((p) => p.groupId === group?.id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalLat, setModalLat] = useState<number | undefined>(undefined);
  const [modalLng, setModalLng] = useState<number | undefined>(undefined);
  const [modalName, setModalName] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (group) {
      setCurrentGroupId(group.id);
    }
  }, [group?.id]);

  const handleOpenAddModal = (lat?: number, lng?: number, name?: string) => {
    setModalLat(lat);
    setModalLng(lng);
    setModalName(name);
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-4 max-w-7xl mx-auto w-full h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-600">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {group?.name || 'Group'} Map
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {groupPlaces.length} pins saved · Tap to explore
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Saved
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Planning
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Visited
          </span>
        </div>
      </div>

      {/* Fullscreen Map Container */}
      <div className="flex-1 relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <GroupMap places={groupPlaces} onOpenAddModal={handleOpenAddModal} />
      </div>

      <AddPlaceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialLat={modalLat}
        initialLng={modalLng}
        initialName={modalName}
      />
    </div>
  );
};
