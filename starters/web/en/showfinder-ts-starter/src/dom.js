/**
 * ShowFinder page elements (index.html).
 * JavaScript module: migrated to TypeScript by an AI agent in T4. Do not modify prior to T4.
 *
 * Call pageElements() inside start(): tests run in Node where there is no page (document),
 * so accessing it at the module top level is not allowed.
 */
export function pageElements() {
  return {
    /** Search form form#search. */
    form: document.querySelector('#search'),
    /** Series title input #search-query. */
    input: document.querySelector('#search-query'),
    /** Status line #status with role="status". */
    status: document.querySelector('#status'),
    /** Content area #content: result cards or show page. */
    content: document.querySelector('#content'),
  };
}
