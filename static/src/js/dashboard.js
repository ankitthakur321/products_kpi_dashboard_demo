import { useState, useEffect, Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class ProductDashboard extends Component {
    static template = "product_kpi_dashboard.DashboardTemplate";

    setup() {
        var self = this;
        this.orm = useService("orm");
        this.bus = useService("bus_service");

        this.state = useState({
            data: [],
            loading: true,
        })

        useEffect(
            () => {
                const loadData = async () => {
                    try{
                        const liveData = await self.fetchData();
                        console.log(liveData);
                        self.state.data = liveData;

                        self.watchOrders(async () => {
                            const updated = await self.fetchData();
                            self.state.data = updated;
                        })

                    }
                    catch(err){
                        console.log(err);
                    }
                    finally{
                        self.state.loading= false;
                    }
                };
                loadData();
            },
            () => []
        );
    }

    async fetchData() {
        const orders = await this.orm.searchRead(
            "sale.order",
            [["state", "in", ["sale", "done"]]],
            ["id"]
        );

        const orderLines = await this.orm.searchRead(
            "sale.order.line",
            [["order_id", "in", orders.map((o)=>o.id)]],
            ["product_id", "order_id", "price_total", "product_uom_qty"]
        );

        const productIds = [...new Set(orderLines.map(line => line.product_id?.[0]).filter(pid => pid))];
        const products = await this.orm.searchRead(
            "product.product",
            [["id", "in", productIds]],
            ["id", "name", "standard_price"]
        );

        const costMap = {};
        for(var p of products){
            costMap[p.id] = p.standard_price || 0;
        }

        const productData = {};
        for(var line of orderLines){
            var prod_id = line.product_id?.[0];
            var prod_name = line.product_id?.[1] || "Other";

            productData[prod_id] = productData[prod_id] || {
                id: prod_id,
                name: prod_name,
                revenue: 0,
                cogs: 0
            }

            productData[prod_id].revenue += line.price_total;
            var qty = line.product_uom_qty || 0;
            var unit_cost = costMap[prod_id] || 0;
            productData[prod_id].cogs += qty * unit_cost;
        }
        console.log(productData);

        return Object.values(productData);
    }


    watchOrders(callback) {
        this.bus.addChannel("sale.order");
        this.bus.start();
        this.bus.subscribe("order_realtime_update", async(message) => {
            await callback();
        });

    }

}


registry.category("actions").add("product_kpi_dashboard.product_dashboard_action", ProductDashboard);

