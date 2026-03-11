import { MultiCalcView } from '~/components/MultiCalcView';
import { PalettePicker } from '~/components/PalettePicker';

const App = () => (
  <div className="max-w-[1200px] mx-auto">
    <h1 className="text-center mb-6 text-3xl">Pokemon Damage Calculator</h1>
    <PalettePicker />
    <MultiCalcView />
  </div>
);

export default App;
