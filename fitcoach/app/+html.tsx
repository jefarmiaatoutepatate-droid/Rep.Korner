/**
 * Enveloppe HTML de la version web (PWA). Expo Router l'utilise pour générer
 * le document servi au navigateur.
 *
 * C'est ici que se joue le « comme une vraie app » sur iPhone : les balises
 * `apple-mobile-web-app-*` retirent l'interface de Safari une fois l'app ajoutée
 * à l'écran d'accueil, et `apple-touch-icon` fournit son icône.
 */
import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover : l'app passe sous la Dynamic Island et la barre d'accueil */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        <title>FitCoach</title>
        <meta name="description" content="Suivi nutrition, musculation et composition corporelle, avec coach virtuel." />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5B6EF5" />

        {/* iOS : mode app plein écran + icône d'écran d'accueil */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FitCoach" />
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <link rel="icon" href="/icon-192.png" />

        {/* Empêche le rebond du scroll natif sur les vues défilantes RN */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: BASE_STYLE }} />
        <script dangerouslySetInnerHTML={{ __html: REGISTER_SW }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

/** Fond cohérent avec le thème clair, avant même que React ne monte. */
const BASE_STYLE = `
  html, body { background-color: #F4F6FB; overscroll-behavior: none; }
  body { -webkit-tap-highlight-color: transparent; }
`;

/** Enregistre le service worker (mode hors ligne). Sans effet si non supporté. */
const REGISTER_SW = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
`;
