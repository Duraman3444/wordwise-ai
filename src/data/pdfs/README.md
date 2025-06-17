# 📚 PDF Resources Directory

## 📁 **Directory Structure**

### `/dictionaries/`
**Purpose**: ESL dictionaries, vocabulary lists, word definitions

**Ideal PDFs:**
- ESL learner dictionaries  
- Academic vocabulary lists
- Phrasal verbs dictionaries
- Collocation dictionaries
- Common mistakes guides

**Format Example:**
```
word (part of speech): definition
Synonyms: word1, word2, word3
Examples: "correct usage" (incorrect: "wrong usage")
```

### `/grammar/`
**Purpose**: Grammar guides, ESL handbooks, grammar rules

**Ideal PDFs:**
- ESL grammar handbooks
- Common grammar mistakes
- Verb tense guides
- Article usage rules
- Preposition guides

**Format Example:**
```
Rule X: Description
Wrong: "incorrect example"
Correct: "correct example"
```

### `/style-guides/`
**Purpose**: Writing style guides, clarity resources

**Ideal PDFs:**
- Academic writing guides
- Business writing resources
- Clarity and conciseness guides
- Formal vs informal writing

**Format Example:**
```
Wordy: "verbose phrase"
Concise: "better alternative"
```

## 🔄 **How to Add PDFs**

1. **Download/Obtain** your PDF resources
2. **Place** them in the appropriate directory above
3. **Restart** the application to load new resources
4. **Test** with text that should trigger the PDF-based rules

## 📊 **Current Status**

The system will automatically:
- ✅ Scan these directories on startup
- ✅ Extract text using PDF parsing libraries
- ✅ Structure data into grammar rules and dictionary entries
- ✅ Apply rules during text analysis
- ✅ Provide PDF-based suggestions with high confidence

## 🔧 **Supported Formats**

- **Text-based PDFs** (preferred)
- **OCR-readable PDFs** (may require conversion)
- **Structured content** (rules, definitions, examples)

## ⚠️ **Notes**

- Currently using mock data for demonstration
- Real PDF parsing requires actual PDF files
- Performance depends on PDF size and complexity
- System will fallback to built-in rules if PDFs unavailable 