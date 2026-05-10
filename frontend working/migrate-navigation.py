import os
import re

root_dir = r'c:\Users\KIIT0001\Desktop\final folder of projects\sharegoods trae\frontend working'

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace import Link from "next/link" with import { Link } from "@/navigation"
    # Handling both double and single quotes
    content = re.sub(r'import Link from ["\']next/link["\']', 'import { Link } from "@/navigation"', content)
    
    # 2. Handle useRouter and usePathname from next/navigation
    # Case: import { useRouter, usePathname } from "next/navigation"
    # Case: import { useRouter, usePathname, useParams } from "next/navigation"
    
    # We want to pull useRouter, usePathname, useParams, redirect from @/navigation
    # But leave useSearchParams and others in next/navigation
    
    next_nav_hooks = ['useRouter', 'usePathname', 'useParams', 'redirect']
    
    def replace_nav_imports(match):
        imports_str = match.group(1)
        imports = [i.strip() for i in imports_str.split(',')]
        
        to_navigation = [i for i in imports if i in next_nav_hooks]
        stay_in_next = [i for i in imports if i not in next_nav_hooks]
        
        result = []
        if to_navigation:
            result.append(f'import {{ {", ".join(to_navigation)} }} from "@/navigation"')
        if stay_in_next:
            result.append(f'import {{ {", ".join(stay_in_next)} }} from "next/navigation"')
            
        return '\n'.join(result)

    # Regex to find imports from next/navigation
    content = re.sub(r'import \{(.*?)\} from ["\']next/navigation["\']', replace_nav_imports, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# Walk through all .tsx and .ts files
for root, dirs, files in os.walk(root_dir):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.next' in dirs:
        dirs.remove('.next')
        
    for file in files:
        if file.endswith(('.tsx', '.ts')) and file != 'navigation.ts' and file != 'i18n.ts':
            update_file(os.path.join(root, file))

print("Global navigation update complete.")
