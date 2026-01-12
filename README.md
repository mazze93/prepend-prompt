# Prepend Prompt

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Transform ordinary user queries into persuasion-enhanced prompts based on **Robert Cialdini's influence principles**. This iOS/macOS Shortcut automatically wraps your input in a structured template and sends it to ChatGPT.

## Table of Contents

- [Overview](#overview)
- [Cialdini's Principles of Influence](#cialdinis-principles-of-influence)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [How It Works](#how-it-works)
- [Requirements](#requirements)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

## Overview

Prepend Prompt enhances your ChatGPT interactions by applying proven psychological influence principles to your queries. By selecting one of Cialdini's six principles at runtime, the shortcut structures your prompt to be more persuasive and effective.

## Cialdini's Principles of Influence

This shortcut implements the six core principles from Robert Cialdini's groundbreaking work on influence and persuasion:

1. **Reciprocity**: People feel obligated to return favors. Prompts acknowledge value exchange.
2. **Commitment and Consistency**: People act consistently with prior commitments. Prompts reference established positions.
3. **Social Proof**: People follow others' actions. Prompts leverage consensus and popular behavior.
4. **Authority**: People respect and follow authority figures. Prompts establish expertise and credibility.
5. **Liking**: People are influenced by those they like. Prompts build rapport and common ground.
6. **Scarcity**: People value rare or limited resources. Prompts emphasize uniqueness and urgency.

## Features

- ✨ Runtime selection of influence principles
- 🔄 Automatic prompt enhancement with structured templates
- 📱 Native iOS/macOS Shortcuts integration
- 🤖 Direct ChatGPT API integration
- 📝 Preserves original query intent while adding persuasive framing
- 🎯 Easy-to-use interface with no coding required

## Installation

### Option 1: Download the Shortcut (Coming Soon)

1. Download the `.shortcut` file from the [Releases](../../releases) page
2. Open the file on your iOS or macOS device
3. Tap/Click "Add Shortcut" when prompted
4. Configure your ChatGPT API key in the shortcut settings

### Option 2: Manual Setup

1. Open the Shortcuts app on your iOS or macOS device
2. Create a new Shortcut
3. Follow the implementation guide (see [How It Works](#how-it-works))
4. Add your ChatGPT API key

## Usage

1. Launch the "Prepend Prompt" shortcut
2. Select one of Cialdini's six influence principles from the menu
3. Enter your query or question
4. The shortcut will:
   - Wrap your query in a principle-specific template
   - Send the enhanced prompt to ChatGPT
   - Display the AI's response

## Examples

### Original Query
```
How can I improve my presentation skills?
```

### With Reciprocity Principle
```
Context: I appreciate your expertise and value your guidance.
Request: In the spirit of exchanging valuable insights, how can I improve my 
presentation skills? I'm happy to share what I learn with others.
```

### With Authority Principle
```
Context: Drawing from research in communication and psychology.
Request: Based on expert studies and best practices in the field, how can I 
improve my presentation skills? Please cite authoritative sources.
```

### With Social Proof Principle
```
Context: Many successful professionals have mastered presentation skills.
Request: What are the most commonly used and proven methods that top presenters 
use to improve their presentation skills?
```

## How It Works

The shortcut follows this workflow:

1. **Principle Selection**: User chooses from six influence principles
2. **Query Input**: User enters their question or request
3. **Template Application**: The shortcut prepends a principle-specific framing
4. **API Call**: Enhanced prompt is sent to ChatGPT API
5. **Response Display**: AI response is shown to the user

### Template Structure

Each principle uses a specific template format:
```
[Principle Context]
[Original Query]
[Principle-Specific Instruction]
```

## Requirements

- iOS 14.0+ or macOS 12.0+ (for Shortcuts app)
- ChatGPT API key (OpenAI account)
- Active internet connection

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report Issues**: Found a bug or have a suggestion? [Open an issue](../../issues)
2. **Improve Templates**: Suggest better prompt templates for each principle
3. **Add Principles**: Propose additional persuasion frameworks
4. **Documentation**: Help improve these docs
5. **Translations**: Translate templates to other languages

### Development Guidelines

- Keep templates concise and effective
- Test changes with various query types
- Maintain consistency with Cialdini's original principles
- Document any changes to template structure

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## References

- Cialdini, R. B. (2006). *Influence: The Psychology of Persuasion*. Harper Business.
- [OpenAI ChatGPT API Documentation](https://platform.openai.com/docs/)
- [Apple Shortcuts User Guide](https://support.apple.com/guide/shortcuts/)

## Acknowledgments

- Inspired by Robert Cialdini's research on influence and persuasion
- Built for the Apple Shortcuts ecosystem
- Designed to enhance AI interactions with psychological principles

---

**Note**: This tool is designed for ethical use in improving communication and problem-solving. Users are responsible for ensuring their prompts comply with ChatGPT's usage policies.
