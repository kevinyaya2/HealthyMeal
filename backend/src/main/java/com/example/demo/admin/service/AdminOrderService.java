package com.example.demo.admin.service;

import com.example.demo.admin.dto.UpdateOrderStatusRequest;
import com.example.demo.model.Order;
import com.example.demo.model.OrderStatus;
import com.example.demo.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;

    public AdminOrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> listOrders() {
        return orderRepository.findAll();
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    public Order updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        OrderStatus status;
        try {
            status = OrderStatus.valueOf(request.status().trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status");
        }

        Order order = getOrder(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
