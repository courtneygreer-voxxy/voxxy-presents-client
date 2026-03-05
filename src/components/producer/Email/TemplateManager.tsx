import { useState } from 'react';
import TemplateLibraryPage from './TemplateLibraryPage';
import TemplateBuilderPage from './TemplateBuilderPage';

type View = 'library' | 'builder';

export default function TemplateManager() {
  const [currentView, setCurrentView] = useState<View>('library');
  const [editingTemplateId, setEditingTemplateId] = useState<number | undefined>();
  const [createFromDefault, setCreateFromDefault] = useState(false);

  const navigateToLibrary = () => {
    setCurrentView('library');
    setEditingTemplateId(undefined);
    setCreateFromDefault(false);
  };

  const navigateToBuilder = (templateId?: number) => {
    if (templateId === undefined) {
      // Creating new sequence from default
      setCreateFromDefault(true);
      setEditingTemplateId(undefined);
    } else {
      // Editing existing sequence
      setCreateFromDefault(false);
      setEditingTemplateId(templateId);
    }
    setCurrentView('builder');
  };

  if (currentView === 'builder') {
    return (
      <TemplateBuilderPage
        templateId={editingTemplateId}
        createFromDefault={createFromDefault}
        onBack={navigateToLibrary}
      />
    );
  }

  return (
    <TemplateLibraryPage
      onNavigateToBuilder={navigateToBuilder}
      onBack={undefined} // No back button - already in dashboard
    />
  );
}
