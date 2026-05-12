import { useState } from 'react';
import UseCaseSelector from './components/UseCaseSelector';
import StoryPage from './components/StoryPage';

export default function App() {
  const [showStory, setShowStory] = useState(true);

  if (showStory) {
    return <StoryPage onEnterApp={() => setShowStory(false)} />;
  }

  return <UseCaseSelector onShowStory={() => setShowStory(true)} />;
}
