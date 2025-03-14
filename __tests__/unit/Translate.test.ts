/* eslint-disable @typescript-eslint/naming-convention */
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import * as translations from '@src/languages/translations';
import type {
  TranslationFlatObject,
  TranslationPaths,
} from '@src/languages/types';
import * as Localize from '@src/libs/Localize';
import asMutable from '@src/types/utils/asMutable';
import {arrayDifference} from '@libs/Utils';

const originalTranslations = {...translations};

asMutable(translations).default = {
  [CONST.LOCALES.EN]: translations.flattenObject({
    testKey1: 'English',
    testKey2: 'Test Word 2',
    testKey3: 'Test Word 3',
    testKeyGroup: {
      testFunction: ({testVariable}) => `With variable ${testVariable}`,
    },
  }),
  [CONST.LOCALES.CS_CZ]: translations.flattenObject({
    testKey1: 'Czech',
    testKey2: 'Czech Word 2',
  }),
};

describe('translate', () => {
  it('Test present key in full locale', () => {
    expect(
      Localize.translate(CONST.LOCALES.CS_CZ, 'testKey1' as TranslationPaths),
    ).toBe('Czech');
  });

  it('Test when key is not found in full locale, but present in language', () => {
    expect(
      Localize.translate(CONST.LOCALES.CS_CZ, 'testKey2' as TranslationPaths),
    ).toBe('Czech Word 2');
  });

  it('Test when key is not found in full locale and language, but present in default', () => {
    expect(
      Localize.translate(CONST.LOCALES.CS_CZ, 'testKey3' as TranslationPaths),
    ).toBe('Test Word 3');
  });

  test('Test when key is not found in default', () => {
    expect(() =>
      Localize.translate(CONST.LOCALES.CS_CZ, 'testKey4' as TranslationPaths),
    ).toThrow(Error);
  });

  test('Test when key is not found in default (Production Mode)', () => {
    const ORIGINAL_IS_IN_PRODUCTION = CONFIG.IS_IN_PRODUCTION;
    asMutable(CONFIG).IS_IN_PRODUCTION = true;
    expect(
      Localize.translate(CONST.LOCALES.CS_CZ, 'testKey4' as TranslationPaths),
    ).toBe('testKey4');
    asMutable(CONFIG).IS_IN_PRODUCTION = ORIGINAL_IS_IN_PRODUCTION;
  });
});

describe('Translation Keys', () => {
  function traverseKeyPath(
    source: TranslationFlatObject,
    path?: string,
    keyPaths?: string[],
  ): string[] {
    const pathArray = keyPaths ?? [];
    const keyPath = path ? `${path}.` : '';
    (Object.keys(source) as Array<keyof TranslationFlatObject>).forEach(key => {
      if (
        typeof source[key] === 'object' &&
        typeof source[key] !== 'function'
      ) {
        // @ts-expect-error - We are modifying the translations object for testing purposes
        traverseKeyPath(source[key], keyPath + key, pathArray);
      } else {
        pathArray.push(keyPath + key);
      }
    });

    return pathArray;
  }

  const excludeLanguages = [CONST.LOCALES.EN, CONST.LOCALES.CS_CZ];
  const languages = Object.keys(originalTranslations.default).filter(
    ln => !excludeLanguages.some(excludeLanguage => excludeLanguage === ln),
  );
  const mainLanguage = originalTranslations.default.en;
  const mainLanguageKeys = traverseKeyPath(mainLanguage);

  languages.forEach(ln => {
    const languageKeys = traverseKeyPath(
      originalTranslations.default[
        ln as keyof typeof originalTranslations.default
      ],
    );

    it(`Does ${ln} locale have all the keys`, () => {
      const hasAllKeys = arrayDifference(mainLanguageKeys, languageKeys);
      if (hasAllKeys.length) {
        console.debug(
          `🏹 [ ${hasAllKeys.join(', ')} ] are missing from ${ln}.js`,
        );
        Error(`🏹 [ ${hasAllKeys.join(', ')} ] are missing from ${ln}.js`);
      }
      expect(hasAllKeys).toEqual([]);
    });

    it(`Does ${ln} locale have unused keys`, () => {
      const hasAllKeys = arrayDifference(languageKeys, mainLanguageKeys);
      if (hasAllKeys.length) {
        console.debug(
          `🏹 [ ${hasAllKeys.join(', ')} ] are unused keys in ${ln}.js`,
        );
        Error(`🏹 [ ${hasAllKeys.join(', ')} ] are unused keys in ${ln}.js`);
      }
      expect(hasAllKeys).toEqual([]);
    });
  });
});

type ReportContentArgs = {content: string};

describe('flattenObject', () => {
  it('It should work correctly', () => {
    const func = ({content}: ReportContentArgs) =>
      `This is the content: ${content}`;
    const simpleObject = {
      common: {
        yes: 'Yes',
        no: 'No',
      },
      complex: {
        activity: {
          none: 'No Activity',
          some: 'Some Activity',
        },
        report: {
          title: {
            expense: 'Expense',
            task: 'Task',
          },
          description: {
            none: 'No description',
          },
          content: func,
          messages: ['Hello', 'Hi', 'Sup!'],
        },
      },
    };

    const result = translations.flattenObject(simpleObject);
    expect(result).toStrictEqual({
      'common.yes': 'Yes',
      'common.no': 'No',
      'complex.activity.none': 'No Activity',
      'complex.activity.some': 'Some Activity',
      'complex.report.title.expense': 'Expense',
      'complex.report.title.task': 'Task',
      'complex.report.description.none': 'No description',
      'complex.report.content': func,
      'complex.report.messages': ['Hello', 'Hi', 'Sup!'],
    });
  });
});
