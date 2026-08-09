import { parseQuickAdd } from '@/lib/parse';

describe('parseQuickAdd', () => {
  it('parse "180g poulet + 100g riz + brocolis"', () => {
    const items = parseQuickAdd('180g poulet + 100g riz + brocolis');
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ name: 'poulet', quantity_g: 180 });
    expect(items[1]).toMatchObject({ name: 'riz', quantity_g: 100 });
    expect(items[2]).toMatchObject({ name: 'brocolis', quantity_g: null });
  });

  it('gère nom avant quantité et "de"', () => {
    const items = parseQuickAdd('riz basmati 80g');
    expect(items[0].name).toBe('riz basmati');
    expect(items[0].quantity_g).toBe(80);
  });

  it('convertit kg/l en grammes', () => {
    expect(parseQuickAdd('1kg poulet')[0].quantity_g).toBe(1000);
    expect(parseQuickAdd('1,5 kg boeuf')[0].quantity_g).toBe(1500);
  });

  it('accepte la virgule décimale', () => {
    expect(parseQuickAdd('12,5g huile')[0].quantity_g).toBe(12.5);
  });

  it('ignore les segments vides', () => {
    expect(parseQuickAdd('poulet ++ , ;')).toHaveLength(1);
  });
});
