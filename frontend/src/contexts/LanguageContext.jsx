import React, { createContext, useContext, useState } from 'react';
import { idiomaInicial } from './idiomaInicial';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  /**
   * O IDIOMA DE ABERTURA NÃO É MAIS `'en'` FIXO.
   *
   * Era `localStorage.getItem('language') || 'en'`, e isso fazia todo visitante novo
   * — inclusive brasileiro — receber o site em inglês, enquanto o `index.html`
   * declarava `lang="pt-br"`. A regra dos três degraus (escolha salva, preferência do
   * navegador, português) mora em `idiomaInicial.js`, com a nota longa do porquê.
   *
   * Fica numa função PURA em módulo separado para poder ser testada sem `window` —
   * mesma decisão de `idadeEm()` em `content/profile.js`.
   */
  const [language, setLanguage] = useState(() =>
    idiomaInicial(
      localStorage.getItem('language'),
      // `languages` (plural) carrega a ordem de preferência real; `language` é o
      // fallback para navegador que não expõe a lista.
      navigator.languages ?? [navigator.language],
    ),
  );

  const updateLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'pt' : 'en';
    updateLanguage(newLang);
  };

  /**
   * O `setLanguage` CRU SAIU DO VALOR DO CONTEXTO, e a remoção é um conserto.
   *
   * Ele estava exposto ao lado de `toggleLanguage`, e os dois faziam coisas
   * diferentes: o toggle persiste no localStorage, o setter cru não. Um consumidor
   * futuro que escolhesse o setter — por ter o nome mais óbvio — trocaria o idioma na
   * tela e perderia a escolha no próximo recarregamento, sem erro nenhum.
   *
   * Ninguém o consumia (só `ui/useSystemToggles.js` usa o toggle), então tirar não
   * quebra nada e fecha a armadilha. Quem precisar definir um idioma específico usa
   * `updateLanguage`, que persiste.
   */
  return (
    <LanguageContext.Provider value={{ language, updateLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
