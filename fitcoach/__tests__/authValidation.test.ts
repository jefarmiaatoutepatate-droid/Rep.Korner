import { isValidEmail, normalizeEmail, checkPassword, validateSignup } from '@/lib/authValidation';

describe('normalizeEmail', () => {
  it('trim + minuscule', () => {
    expect(normalizeEmail('  Test@Mail.COM ')).toBe('test@mail.com');
  });
});

describe('isValidEmail', () => {
  it('accepte une adresse valide', () => {
    expect(isValidEmail('nathan@fitcoach.app')).toBe(true);
  });
  it('rejette les invalides', () => {
    expect(isValidEmail('nathan')).toBe(false);
    expect(isValidEmail('nathan@mail')).toBe(false);
    expect(isValidEmail('a b@mail.com')).toBe(false);
  });
});

describe('checkPassword', () => {
  it('exige 8+ caractères, lettre et chiffre', () => {
    expect(checkPassword('short1').ok).toBe(false);
    expect(checkPassword('password').ok).toBe(false); // pas de chiffre
    expect(checkPassword('12345678').ok).toBe(false); // pas de lettre
    expect(checkPassword('password1').ok).toBe(true);
  });
});

describe('validateSignup', () => {
  it('renvoie null si tout est valide', () => {
    expect(validateSignup({ name: 'Nathan', email: 'n@fit.app', password: 'secret12' })).toBeNull();
  });
  it('renvoie une erreur sinon', () => {
    expect(validateSignup({ name: 'N', email: 'n@fit.app', password: 'secret12' })).toMatch(/prénom/i);
    expect(validateSignup({ name: 'Nathan', email: 'bad', password: 'secret12' })).toMatch(/e-mail/i);
    expect(validateSignup({ name: 'Nathan', email: 'n@fit.app', password: 'x' })).toMatch(/8 car/i);
  });
});
