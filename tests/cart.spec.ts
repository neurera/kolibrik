import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('TC-03 STUDENT dáva 10 % z celého košíka', async ({ page }) => {
  await page.getByRole('button', { name: /Testovanie softvéru/ }).click();
  await page.getByLabel('Zľavový kód').fill('STUDENT');
  await page.getByRole('button', { name: 'Použiť' }).click();
  await expect(page.locator('#total')).toHaveText('9,00 €');
});

test('TC-07 zľava platí aj pri viacerých kusoch', async ({ page }) => {
  await page.getByRole('button', { name: /Testovanie softvéru/ }).click();
  await page.getByRole('button', { name: /Testovanie softvéru/ }).click();
  await page.getByLabel('Zľavový kód').fill('STUDENT');
  await page.getByRole('button', { name: 'Použiť' }).click();
  await expect(page.locator('#discount')).toHaveText('2,00 €');
  await expect(page.locator('#total')).toHaveText('18,00 €');
});

test('TC-05 neplatný kód – hláška a žiadna zľava', async ({ page }) => {
  await page.getByRole('button', { name: /Playwright v praxi/ }).click();
  await page.getByLabel('Zľavový kód').fill('BLABLA');
  await page.getByRole('button', { name: 'Použiť' }).click();
  await expect(page.getByText('Neplatný kód')).toBeVisible();
  await expect(page.locator('#total')).toHaveText('25,00 €');
});
