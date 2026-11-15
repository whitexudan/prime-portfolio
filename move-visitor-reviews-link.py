#!/usr/bin/env python3
from pathlib import Path

admin_path = Path('components/admin/AdminDashboard.tsx')
css_path = Path('app/globals.css')
if not admin_path.is_file() or not css_path.is_file():
    raise SystemExit('Lance ce script depuis la racine de prime-portfolio.')
admin = admin_path.read_text(encoding='utf-8')
css = css_path.read_text(encoding='utf-8')

old_link = r'''{auth&&<a className="admin-review-link" href="/admin/reviews">{lang==='fr'?'Avis visiteurs':'Visitor reviews'} ↗</a>}'''
new_link = r'''{auth&&<a className="admin-review-nav-link" href="/admin/reviews">{lang==='fr'?'Avis visiteurs':'Visitor reviews'} ↗</a>}'''
old_nav = r'''<nav aria-label={t.admin}>{Object.entries(names).map(([key,name])=><button type="button" className={collection===key?'selected':''} key={key} onClick={()=>switchCollection(key as keyof Data)}>{name}</button>)}</nav>'''
new_nav = r'''<nav aria-label={t.admin}>{Object.entries(names).map(([key,name])=><button type="button" className={collection===key?'selected':''} key={key} onClick={()=>switchCollection(key as keyof Data)}>{name}</button>)}{auth&&<a className="admin-review-nav-link" href="/admin/reviews">{lang==='fr'?'Avis visiteurs':'Visitor reviews'} ↗</a>}</nav>'''

# Vérifier les deux emplacements avant toute écriture.
if admin.count(old_link) == 1:
    updated_admin = admin.replace(old_link, '', 1)
    if updated_admin.count(old_nav) != 1:
        raise SystemExit('Menu vertical introuvable ou ambigu; aucun fichier modifié.')
    updated_admin = updated_admin.replace(old_nav, new_nav, 1)
elif admin.count(new_link) == 1 and admin.count(new_nav) == 1:
    updated_admin = admin
else:
    raise SystemExit('Lien Avis visiteurs ou menu admin inattendu; aucun fichier modifié.')

# Nettoyer les règles qui ne servent plus au lien d’en-tête.
updated_css = css
for obsolete in (
    '.admin-review-link{font-size:11px;padding:8px 11px;border:1px solid var(--line);border-radius:99px;white-space:nowrap;color:var(--fg)}',
    '.admin-review-link{font-size:10px;padding:7px 9px}',
    '.admin-review-link{white-space:normal}',
):
    updated_css = updated_css.replace(obsolete, '')
marker = '/* Visitor reviews link in the vertical admin menu */'
if marker not in updated_css:
    updated_css = updated_css.rstrip() + '''\n\n/* Visitor reviews link in the vertical admin menu */
.admin-layout>nav .admin-review-nav-link{display:block;border:1px solid var(--line);border-radius:30px;padding:9px 14px;color:var(--fg);font:inherit;text-align:left;text-decoration:none}
@media(max-width:1150px){.admin-layout>nav .admin-review-nav-link{font-size:11px}}
'''

admin_path.write_text(updated_admin, encoding='utf-8')
css_path.write_text(updated_css, encoding='utf-8')
print('Lien des avis déplacé dans le menu vertical de gestion.')
