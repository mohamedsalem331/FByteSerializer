import process from "node:process";
import stream, { TransformCallback } from "node:stream";
import fs from "fs";
import readline from "readline";

//ignore
/**
const buffer = Buffer.alloc(16); // Create a buffer of 16 bytes

buffer.writeUInt8(55, 0);             // Write an unsigned 8-bit integer at offset 0
buffer.writeUInt16LE(65000, 1);        // Write an unsigned 16-bit integer (little-endian) at offset 1

const uint8 = buffer.readUInt8();               // Read an unsigned 8-bit integer from offset 0
const uint16 = buffer.readUInt16LE(0);           // Read an unsigned 16-bit integer (little-endian) from offset 1

*/


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptUser = (query: any) => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

// get user inputs
const getUserInputs = async (): Promise<{
  characterFlag: string;
  filePath: string;
}> => {
  const characterFlag = (await promptUser("Enter the character to removed: ")) as string;
  const filePath = (await promptUser("Enter the filepath: ")) as string;

  if (!characterFlag || !filePath) {
    console.warn(
      "Usage: npm start --character <unique_characters> --filepath <path_to_file>"
    );
    process.exit(1);
  }

  const options = { characterFlag, filePath };

  return options;
};

rl.on("close", function () {
  console.log("\nProcess Finished, BYE BYE!!");
  process.exit(0);
});

getUserInputs()
  .then((result) => {
    const { characterFlag, filePath } = result;

    const filePathSplit = filePath.split("\\");
    const fileName = filePathSplit[filePathSplit.length - 1];

    const _fs = fs.createReadStream(filePath, { highWaterMark: 2000 });
    const _ws = fs.createWriteStream(`_${fileName}`);

    const removeCharsTransform = new stream.Transform({
      transform(
        chunk: any,
        encoding: BufferEncoding,
        callback: TransformCallback
      ) {
        const filtered = chunk.filter(
          (byte: number) => byte !== characterFlag.charCodeAt(0) && byte !== 0x00
        );

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

    _fs.on("end", () => {
      console.log("Finished");
      rl.close();
    });
  })
  .catch((error) => {
    console.log(error);
  });


