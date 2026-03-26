package com.example.demo.controller;

import com.example.demo.model.MenuItem;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class MealController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/menu")
    public List<MenuItem> getMenu() {
        return menuItemRepository.findAll();
    }

    @PostMapping("/orders")
    public Order createOrder(@RequestBody List<OrderItem> items) {
        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        
        int total = 0;
        for (OrderItem item : items) {
            item.setId(null); // 清除從前端菜單傳過來的 ID，讓資料庫自動產生新的 ID
            item.setOrder(order);
            total += item.getPrice() != null ? item.getPrice() : 0;
        }
        
        order.setItems(items);
        order.setTotalPrice(total);
        
        return orderRepository.save(order);
    }

    @GetMapping("/orders")
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }
}
