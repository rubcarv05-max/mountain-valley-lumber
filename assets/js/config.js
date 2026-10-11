/*
  Site settings: the only file you need to edit to go live.

  PHONE
    display: how the number should appear, e.g. "(719) 555-0123"
    dial:    the same number for tap-to-call, digits only with country code, e.g. "+17195550123"
    Until both are filled in, the site shows "[PHONE NUMBER]" and the call buttons
    scroll to the contact section instead of dialing.

  ESTIMATE FORM
    endpoint: the URL that receives form submissions. Any service that accepts a
              standard form POST and returns JSON works. For example, with Formspree
              (formspree.io) create a form and paste its URL, e.g.
              "https://formspree.io/f/abcdwxyz".
    extraFields: optional hidden values some services require, e.g. Web3Forms needs
              { access_key: "your-key" }.
    Until an endpoint is set, submitting the form shows a clear "not connected yet"
    message and asks people to call. It never pretends a request was sent.
*/
window.SITE_CONFIG = {
  phone: {
    display: "(719) 655-2400",
    dial: "+17196552400"
  },
  form: {
    endpoint: "",
    extraFields: {}
  }
};
