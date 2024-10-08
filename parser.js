function parseScript(scriptText) {
    const lines = scriptText.split('\n');
    const messagesData = [];

    for (let line of lines) {
        line = line.trim();
        if (!line) continue; // Skip empty lines

        const messageData = {};

        // Check if line starts with [left] or [right]
        let sideMatch = line.match(/^\[(left|right)\]/);
        if (sideMatch) {
            const sideTag = sideMatch[0];
            messageData.side = sideTag.substring(1, sideTag.length - 1); // 'left' or 'right'
            line = line.substring(sideTag.length).trim(); // Remove the side tag from the line

            // Now check for optional flags
            let flagMatch = line.match(/^\[(green|blue|image)\]/);
            while (flagMatch) {
                const flagTag = flagMatch[0];
                const flagContent = flagTag.substring(1, flagTag.length - 1); // e.g., 'green' or 'image'
                if (flagContent === 'green' || flagContent === 'blue') {
                    messageData.color = flagContent;
                } else if (flagContent === 'image') {
                    messageData.type = 'image';
                }
                line = line.substring(flagTag.length).trim();
                flagMatch = line.match(/^\[(green|blue|image)\]/);
            }

            // Default values
            if (!messageData.type) messageData.type = 'text';
            if (!messageData.color && messageData.side === 'right') messageData.color = 'blue';

            // Now, the rest of the line is the content (for text messages)
            if (messageData.type === 'text') {
                messageData.content = line;
            }

            messagesData.push(messageData);
        }
    }

    return messagesData;
}
