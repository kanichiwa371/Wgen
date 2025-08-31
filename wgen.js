const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});
const fs = require("fs");
const path = require("path");
const cliProgress = require("cli-progress");

const MAX_WORDS = 10;
const MAX_NUMBER = 9999999;  // Limit to prevent disk crash
const BUFFER_SIZE = 1000;
const TEMP_FILE = `wordlist_temp_${Date.now()}.txt`;

const colors = {
    purple: "\x1b[35m",
    reset: "\x1b[0m"
};

let words = [];

console.clear();
console.log(` ${colors.purple}
 /$$      /$$                              
| $$  /$ | $$                              
| $$ /$$$| $$  /$$$$$$   /$$$$$$  /$$$$$$$ 
| $$/$$ $$ $$ /$$__  $$ /$$__  $$| $$__  $$
| $$$$_  $$$$| $$  \ $$| $$$$$$$$| $$  \ $$
| $$$/ \  $$$| $$  | $$| $$_____/| $$  | $$
| $$/   \  $$|  $$$$$$$|  $$$$$$$| $$  | $$
|__/     \__/ \____  $$ \_______/|__/  |__/
              /$$  \ $$                    
             |  $$$$$$/                    
              \______/                         
    ${colors.reset}`);

// Manage clean close
process.on('SIGINT', () => {
    cleanupTempFile();
    console.log('\nProcess interrupted. Exiting...');
    process.exit(0);
});

function cleanupTempFile() {
    if (fs.existsSync(TEMP_FILE)) {
        try {
            fs.unlinkSync(TEMP_FILE);
        } catch (error) {
            // Silently fail if we can't delete the temp file
        }
    }
}

function askWord(count) {
    const message = count === 0
        ? "Enter words for the wordlist, up to a maximum of 10. If you don't want to add more, leave this field blank: "
        : `Current words: ${count}\nNext word: `;

    rl.question(message, (word) => {
        if (word.trim() === "") {
            if (words.length === 0) {
                console.log("No words entered, exiting...");
                rl.close();
                return;
            }
            askRange();
        } else {
            words.push(word.trim());
            
            if (words.length >= MAX_WORDS) {
                console.log(`\nMax words reached (${MAX_WORDS}).`);
                askRange();
            } else {
                askWord(words.length);
            }
        }   
    });
}

function generateWordlist(startNum, endNum) {
    console.log("\nGenerating Wordlist..."); 
    
    // Validate numeric range
    const validatedStartNum = Math.max(0, startNum);
    const validatedEndNum = Math.min(MAX_NUMBER, endNum);
    
    if (validatedStartNum !== startNum || validatedEndNum !== endNum) {
        console.log(`Range adjusted to ${validatedStartNum}-${validatedEndNum} for safety.`);
    }

    const totalIterations = words.length * (validatedEndNum - validatedStartNum + 1) * words.length * 58;
    
    // Warn if the file is so big
    if (totalIterations > 10000000) {
        console.log(`Warning: This will generate approximately ${totalIterations.toLocaleString()} combinations.`);
        console.log("This might take a long time and create a very large file.");
        
        rl.question("Do you want to continue? (y/N): ", (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                continueGeneration(validatedStartNum, validatedEndNum, totalIterations);
            } else {
                console.log("Operation cancelled.");
                rl.close();
            }
        });
    } else {
        continueGeneration(validatedStartNum, validatedEndNum, totalIterations);
    }
}

function continueGeneration(startNum, endNum, totalIterations) {
    const bar = new cliProgress.SingleBar({
        format: `Progress |{bar}| {percentage}%| {value}/${totalIterations} Combinations`,
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true
    });
    
    bar.start(totalIterations, 0);
    const writeStream = fs.createWriteStream(TEMP_FILE);

    let progress = 0;
    let lastPercentage = -1;
    let buffer = "";

    try {
        for (let i = 0; i < words.length; i++) {
            for (let num = startNum; num <= endNum; num++) {
                for (let j = 0; j < words.length; j++) {
                    // This generate ALL the combinations
                    buffer += words[i] + num + words[j] + "\n"; progress++;
                    buffer += words[i] + "_" + words[j] + "_" + num + "\n"; progress++;
                    buffer += words[i] + "." + words[j] + "." + num + "\n"; progress++;
                    buffer += words[i] + "_" + words[j] + "." + num + "\n"; progress++;
                    buffer += words[i] + "." + words[j] + "_" + num + "\n"; progress++;
                    buffer += words[i] + "-" + words[j] + "-" + num + "\n"; progress++;
                    buffer += words[i] + "@" + words[j] + "@" + num + "\n"; progress++;
                    buffer += words[i] + "#" + words[j] + "#" + num + "\n"; progress++;
                    buffer += words[i] + "$" + words[j] + "$" + num + "\n"; progress++;
                    buffer += words[i] + "!" + words[j] + "!" + num + "\n"; progress++;
                    buffer += words[i] + "." + words[j] + "_" + "\n"; progress++;
                    buffer += words[i] + "." + words[j] + "." + "\n"; progress++;
                    buffer += words[i] + "_" + words[j] + "_" + "\n"; progress++;
                    buffer += words[i] + "_" + words[j] + "." + "\n"; progress++;
                    buffer += words[i] + "@" + words[j] + "@" + "\n"; progress++;
                    buffer += words[i] + "@" + words[j] + "." + "\n"; progress++;
                    buffer += words[i] + "-" + words[j] + "-" + "\n"; progress++;
                    buffer += words[i] + "#" + words[j] + "#" + "\n"; progress++;
                    buffer += words[i] + "$" + words[j] + "$" + "\n"; progress++;
                    buffer += words[i] + "!" + words[j] + "!" + "\n"; progress++;
                    buffer += words[j] + num + words[i] + "\n"; progress++;
                    buffer += words[j] + "_" + words[i] + "_" + num + "\n"; progress++;
                    buffer += words[j] + "." + words[i] + "." + num + "\n"; progress++;
                    buffer += words[j] + "_" + words[i] + "." + num + "\n"; progress++;
                    buffer += words[j] + "." + words[i] + "_" + num + "\n"; progress++;
                    buffer += words[i].charAt(0).toUpperCase() + words[i].slice(1) + num + words[j] + "\n"; progress++;
                    buffer += words[i] + num + words[j].charAt(0).toUpperCase() + words[j].slice(1) + "\n"; progress++;
                    buffer += words[i].charAt(0).toUpperCase() + words[i].slice(1) + "_" + words[j] + "_" + num + "\n"; progress++;
                    buffer += num + words[i] + words[j] + "\n"; progress++;
                    buffer += words[i] + words[j] + num + "\n"; progress++;
                    buffer += num + "_" + words[i] + "_" + words[j] + "\n"; progress++;
                    buffer += words[i] + "_" + num + "_" + words[j] + "\n"; progress++;
                    buffer += words[i] + "2023" + words[j] + "\n"; progress++;
                    buffer += words[i] + "2024" + words[j] + "\n"; progress++;
                    buffer += words[i] + "_2023_" + words[j] + "\n"; progress++;
                    buffer += words[i] + "_2024_" + words[j] + "\n"; progress++;
                    buffer += words[i] + "123" + words[j] + "\n"; progress++;
                    buffer += words[i] + "1234" + words[j] + "\n"; progress++;
                    buffer += words[i] + "12345" + words[j] + "\n"; progress++;
                    buffer += words[i] + "123456" + words[j] + "\n"; progress++;
                    buffer += "admin" + num + words[j] + "\n"; progress++;
                    buffer += "root" + num + words[j] + "\n"; progress++;
                    buffer += words[i] + num + "admin" + "\n"; progress++;
                    buffer += words[i] + num + "root" + "\n"; progress++;
                    buffer += words[i] + words[j] + words[i] + num + "\n"; progress++;
                    buffer += words[i] + num + words[j] + num + "\n"; progress++;
                    buffer += words[i] + "_" + num + "_" + words[j] + "_" + num + "\n"; progress++;
                    buffer += words[i] + words[j] + "\n"; progress++;
                    buffer += words[i] + "_" + words[j] + "\n"; progress++;
                    buffer += words[i] + "." + words[j] + "\n"; progress++;
                    buffer += words[i] + "-" + words[j] + "\n"; progress++;
                    buffer += words[i] + "@" + words[j] + "\n"; progress++;
                    buffer += words[i] + "#" + words[j] + "\n"; progress++;
                    buffer += words[i] + num + "\n"; progress++;
                    buffer += words[i] + "_" + num + "\n"; progress++;
                    buffer += words[i] + "." + num + "\n"; progress++;
                    buffer += num + words[i] + "\n"; progress++;
                    buffer += num + "_" + words[i] + "\n"; progress++;
                    buffer += num + "." + words[i] + "\n"; progress++;

                    if (progress % BUFFER_SIZE === 0) {
                        writeStream.write(buffer);
                        buffer = "";
                    }

                    const currentPercentage = Math.floor((progress / totalIterations) * 100);
                    if (currentPercentage !== lastPercentage) {
                        bar.update(progress);
                        lastPercentage = currentPercentage;
                    }
                }
            }
        }

        
        if (buffer.length > 0) {
            writeStream.write(buffer);       // Write every string left in the buffer
        }

        writeStream.end(() => {
            bar.update(totalIterations);
            bar.stop();
            askFilename();
        });
    } catch (error) {
        console.error("\nError generating wordlist:", error.message);
        cleanupTempFile();
        rl.close();
    }
}

function askRange() {
    rl.question("Start number in range? (default 0): ", (start) => {
        rl.question("Last number in range? (default 9999): ", (end) => {
            const startNum = start.trim() === "" ? 0 : parseInt(start, 10);
            const endNum = end.trim() === "" ? 9999 : parseInt(end, 10);
        
            if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
                console.log("Invalid Range, using default (0-9999)");
                generateWordlist(0, 9999);
            } else {
                generateWordlist(startNum, endNum);
            }
        });
    });
}

function askFilename() {
    rl.question("What name do you want for your wordlist?: ", (filename) => {
        if (!filename.trim()) {
            filename = "wordlist";
        }
        
        
        const safeFilename = path.basename(filename.trim()) + ".txt";  // Prevent trasversal path
        
        try {
            if (fs.existsSync(safeFilename)) {
                rl.question(`File ${safeFilename} already exists. Overwrite? (y/N): `, (answer) => {
                    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                        completeFileRename(safeFilename);
                    } else {
                        askFilename(); // Ask for a different name
                    }
                });
            } else {
                completeFileRename(safeFilename);
            }
        } catch (error) {
            console.error("Error:", error.message);
            cleanupTempFile();
            rl.close();
        }
    });
}

function completeFileRename(safeFilename) {
    try {
        fs.renameSync(TEMP_FILE, safeFilename);
        
        const stats = fs.statSync(safeFilename);
        const fileSize = stats.size / (1024 * 1024);
        
        console.log(`Wordlist generated successfully!`);
        console.log(`File: ${safeFilename}`);
        console.log(`Size: ${fileSize.toFixed(2)} MB`);
        
        const estimatedLines = Math.floor(stats.size / 20);
        console.log(`Estimated combinations: ${estimatedLines.toLocaleString()}`);
    } catch (error) {
        console.error("Error saving file:", error.message);
    } finally {
        rl.close();
    }
}


askWord(0);   // start the program