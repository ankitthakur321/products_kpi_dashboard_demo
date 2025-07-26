from odoo import models, api

class SaleOrder(models.Model):
    _inherit = "sale.order"


    def action_confirm(self):
        res = super().action_confirm()

        self.env["bus.bus"]._sendone(self._name, 'order_realtime_update', "Update Revenue and COGS")
        return res
    

    def write(self, vals):
        res = super().write(vals)
        self.env["bus.bus"]._sendone(self._name, 'order_realtime_update', "Update Revenue and COGS")
        return res
