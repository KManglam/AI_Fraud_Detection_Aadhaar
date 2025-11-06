import re

raw_text = """wens ine ce ee gp em
i wv a xd
J es CIGOVERNMENT.OF.INDIA SO === —
i ~Bmes3 Bo mood
/ (Lohit N Sunkad
CALS Sar / Year of Birth 2 1991
| Reba / Male veces:
| f Osten
; Ne . ps5
5003 9998 0641 ert
esqooe — MBA, VHT0d
73l Gegeaaebass med
| 2ZNN. mong oerincaTion aumonN oF wole
: Lid
BIO Rated, chad 90 SLM, S/O Nagesh, House No
| ortch wid, Aeeved, Racsed, 22/35, Sangam Nagar,
Lvrpo, smrud, 591307 Gokak, Gokak, Belgaum,
Karnataka, 591307
— .
2 P=) =. N
we sont ese neaty @ ries gn in een omen "sats ;
"""

lines = [l.strip() for l in raw_text.split('\n') if l.strip()]

print("All lines:")
for i, line in enumerate(lines):
    print(f"{i}: '{line}'")

print("\n\nLooking for names after GOVERNMENT/INDIA:")
for i, line in enumerate(lines):
    if 'GOVERNMENT' in line or 'INDIA' in line:
        print(f"\nFound keyword at line {i}: '{line}'")
        for j in range(i+1, min(i+5, len(lines))):
            candidate = lines[j].strip()
            words = candidate.split()
            if candidate and 2 <= len(words) <= 4 and 5 <= len(candidate) <= 50:
                if re.match(r'^[A-Za-z\s]+$', candidate):
                    has_capital = any(word[0].isupper() for word in words if word)
                    print(f"  Line {j}: '{candidate}' - Has capital: {has_capital}")

print("\n\nAll capitalized 2-4 word lines:")
for i, line in enumerate(lines):
    words = line.split()
    if line and 2 <= len(words) <= 4 and 5 <= len(line) <= 50:
        if re.match(r'^[A-Za-z\s]+$', line):
            has_capital = any(word[0].isupper() for word in words if word)
            if has_capital:
                print(f"Line {i}: '{line}'")
