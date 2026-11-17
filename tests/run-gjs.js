// Optional adapter for systems with GJS but no Node. Run from the repository root.
const GLib = imports.gi.GLib;
const read = (path) => {
  const [ok, bytes] = GLib.file_get_contents(path);
  if (!ok) throw new Error('Cannot read ' + path);
  return imports.byteArray.toString(bytes);
};
const original = read('interactief/voyager-1/index.html');
const bytes = imports.byteArray.fromString(original);
const header = imports.byteArray.fromString('blob ' + bytes.length);
const gitBytes = new Uint8Array(header.length + 1 + bytes.length);
gitBytes.set(header); gitBytes.set(bytes, header.length + 1);
const blob = GLib.compute_checksum_for_data(GLib.ChecksumType.SHA1, gitBytes);
if (blob !== '971558a2a0b6ee0aa1f87a12ec4c1b896a46246c') throw new Error('Original Voyager file changed!');
(0, eval)(read('tests/cases.js'));
globalThis.runScientiasTests(read, print);
void 0;
