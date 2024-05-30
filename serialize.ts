import process from "node:process"
import stream, { TransformCallback } from "node:stream"
import fs from "fs"

// Set up the listener for SIGINT
process.on("SIGINT", () => {
  console.log("Process Stopped.");
  process.exit(1);
});

// receive input from user while process is running instead


// Parse CLI arguments
const args = process.argv.slice(2);
const options: any = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const currArg = args[i].split("=");
    options[currArg[0]] = currArg[1].trim();
  } else {
    console.info(
      "Usage: node index.js --character= <unique_characters> --filepath= <path_to_file>/file.{extension}"
    );
    process.exit(1);
  }
}

const characterFlag = options["--character"];
const filePath = options["--filepath"];

// validate the input
if (!characterFlag || !filePath) {
  console.info(
    "Usage: node index.js --character <unique_characters> --filepath <path_to_file>"
  );
  process.exit(1);
}
const filePathSplit = filePath.split("\\");
const fileName = filePathSplit[filePathSplit.length - 1];

const _fs = fs.createReadStream(filePath, { highWaterMark: 2000 });
const _ws = fs.createWriteStream(`_${fileName}`);

const removeCharsTransform = new stream.Transform({
  transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    const filtered = chunk.filter(
      (byte: number) => byte !== characterFlag.charCodeAt(0) && byte !== 0x00
    );
    console.log(filtered);

    if (!this.push(filtered)) {
      _fs.pause();
    }
    callback();
  },
});

_ws.on("drain", () => {
  _fs.resume();
});

_fs.pipe(removeCharsTransform).pipe(_ws);

// const rl = readline.createInterface({
//   input: readStream,
//   crlfDelay: Infinity  // Recognize all instances of CR LF ('\r\n') in input as a single line break.
// });

//const buffer = Buffer.alloc(16); // Create a buffer of 16 bytes

//buffer.writeUInt8(0xFF, 0);             // Write an unsigned 8-bit integer at offset 0
//buffer.writeUInt16LE(65535, 1);        // Write an unsigned 16-bit integer (little-endian) at offset 1

//const uint8 = buffer.readUInt8();               // Read an unsigned 8-bit integer from offset 0
//const uint16 = buffer.readUInt16LE();           // Read an unsigned 16-bit integer (little-endian) from offset 1
