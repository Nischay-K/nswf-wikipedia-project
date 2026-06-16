import re
import sys

def verify_mediawiki_syntax(filepath):
    print(f"Verifying {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = 0

    # 1. Check matching ref tags (excluding self-closing tags like <ref name="x" />)
    ref_open_count = len(re.findall(r'<ref(?![^>]*/>)[ >]', content))
    ref_close_count = len(re.findall(r'</ref>', content))
    ref_self_closing_count = len(re.findall(r'<ref[^>]*/>', content))
    print(f"Ref tags: Open count = {ref_open_count}, Close count = {ref_close_count}, Self-closing count = {ref_self_closing_count}")
    if ref_open_count != ref_close_count:
        print("ERROR: Unbalanced <ref> and </ref> tags!")
        errors += 1

    # 2. Check unbalanced curly braces {{ and }}
    # We do a basic bracket count
    brace_open_count = content.count('{{')
    brace_close_count = content.count('}}')
    print(f"Double Braces: Open count = {brace_open_count}, Close count = {brace_close_count}")
    if brace_open_count != brace_close_count:
        print("ERROR: Unbalanced double curly braces {{ and }}!")
        errors += 1

    # 3. Check unbalanced square brackets [[ and ]]
    bracket_open_count = content.count('[[')
    bracket_close_count = content.count(']]')
    print(f"Double Brackets (Links/Categories): Open count = {bracket_open_count}, Close count = {bracket_close_count}")
    if bracket_open_count != bracket_close_count:
        print("ERROR: Unbalanced double square brackets [[ and ]]!")
        errors += 1

    # 4. Check for promotional/non-neutral words
    promotional_words = ['amazing', 'outstanding', 'wonderful', 'noble', 'greatest', 'heroic', 'visionary', 'incredible']
    for word in promotional_words:
        matches = re.findall(rf'\b{word}\b', content, re.IGNORECASE)
        if matches:
            print(f"WARNING: Found potential non-neutral/promotional word: '{word}' ({len(matches)} occurrences)")

    # 5. Check sentence casing in headings (Wikipedia style)
    headings = re.findall(r'^(==+)\s*(.*?)\s*\1\s*$', content, re.MULTILINE)
    proper_nouns = {'Pune', 'Maharashtra', 'India', 'GIPE', 'NSWF', 'France', 'Ganesh', 'Utsav', 'CPCB', 'WHO', 'Social', 'Worker', 'Samaj', 'Ratan', 'Spandan', 'National', 'Achiever', 'Honk'}
    print(f"Checking {len(headings)} headings for sentence case compliance...")
    for level, title in headings:
        clean_title = title.strip('\'" ')
        words = clean_title.split()
        if not words:
            continue
        for word in words[1:]:
            clean_word = re.sub(r'[^\w]', '', word)
            if clean_word and clean_word[0].isupper():
                if clean_word not in proper_nouns:
                    print(f"WARNING: Heading '{title}' may not follow sentence case (capitalized word: '{word}')")

    if errors == 0:
        print("SUCCESS: MediaWiki syntax validation passed!")
        return True
    else:
        print(f"FAILED: Found {errors} syntax error(s).")
        return False

if __name__ == "__main__":
    filepath = "C:/Users/nisch/.gemini/antigravity/scratch/nswf-wikipedia-project/wikipedia_draft.mw"
    success = verify_mediawiki_syntax(filepath)
    if not success:
        sys.exit(1)
