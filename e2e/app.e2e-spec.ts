import { MisProjectPage } from './app.po';

describe('mis-project App', () => {
  let page: MisProjectPage;

  beforeEach(() => {
    page = new MisProjectPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
