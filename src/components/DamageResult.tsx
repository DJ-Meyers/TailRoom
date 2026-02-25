interface Props {
  result: {
    desc: string;
    range: [number, number] | null;
    koChance: string;
    defenderMaxHp: number;
  } | null;
}

export function DamageResult({ result }: Props) {
  if (!result) {
    return (
      <div className="damage-result">
        <p className="placeholder">Select two Pokemon and a move to see damage</p>
      </div>
    );
  }

  const { desc, range, koChance, defenderMaxHp } = result;
  const minPct = range ? ((range[0] / defenderMaxHp) * 100).toFixed(1) : '?';
  const maxPct = range ? ((range[1] / defenderMaxHp) * 100).toFixed(1) : '?';

  return (
    <div className="damage-result">
      <p className="desc">{desc}</p>
      {range && (
        <p className="range">
          {range[0]} - {range[1]} ({minPct}% - {maxPct}%)
        </p>
      )}
      {koChance && <p className="ko-chance">{koChance}</p>}
    </div>
  );
}
