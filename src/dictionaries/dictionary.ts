import 'server-only'

const dictionaries = {
    en: () => import('./en.json').then((module) => module.default),
    ja: () => import('./ja.json').then((module) => module.default),
}

export const getDictionary = async (locale: 'en' | 'ja') => dictionaries[locale]()
