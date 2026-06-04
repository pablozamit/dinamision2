interface AvatarBubbleProps {
  text: string;
}

export default function AvatarBubble({ text }: AvatarBubbleProps) {
  return (
    <div className="fi-avatar-section">
      <div className="fi-avatar-container">
        <img
          src="/avatar.png"
          alt="Avatar de la marca"
          className="fi-avatar-img"
        />
      </div>
      <div className="fi-speech-bubble">
        <p className="fi-speech-text">{text}</p>
      </div>
    </div>
  );
}
