export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.value} type="button" className={`tab ${activeTab === tab.value ? 'active' : ''}`} onClick={() => onChange(tab.value)} role="tab">
          {tab.label}
        </button>
      ))}
    </div>
  );
}
