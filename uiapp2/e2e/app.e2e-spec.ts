import { Uiapp2Page } from './app.po';

describe('uiapp2 App', () => {
  let page: Uiapp2Page;

  beforeEach(() => {
    page = new Uiapp2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
