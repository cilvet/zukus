import { useIsDesktop } from '../../navigation';
import { CompendiumsScreenDesktop } from './CompendiumsScreenDesktop';
import { CompendiumsScreenMobile } from './CompendiumsScreenMobile';

export function CompendiumsScreen() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <CompendiumsScreenDesktop /> : <CompendiumsScreenMobile />;
}
