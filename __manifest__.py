{
    'name': 'Realtime Products KPIs Dashboard',
    'category': 'Sales',
    'sequence': 0,
    'summary': 'Publish blog posts, announces, news',
    'version': '1.0.0',
    'depends': ['sale_management', 'web', "bus"],
    'data': [
        "views/menuitems.xml"
    ],
    'installable': True,
    'assets': {
        'web.assets_backend': [
            "products_kpi_dashboard/static/src/js/dashboard.js",
            "products_kpi_dashboard/static/src/xml/templates.xml"
        ],
    },
    'application': True,
}
