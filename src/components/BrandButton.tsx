interface BrandButtonProps {
  name: string;
  onClick: () => void;
  selected?: boolean;
}

export default function BrandButton({ name, onClick, selected }: BrandButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fi-brand-btn ${selected ? 'fi-brand-btn--selected' : ''}`}
    >
      {name}
    </button>
  );
}
