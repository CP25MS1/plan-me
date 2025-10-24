package capstone.ms.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class Cp25Ms1BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(Cp25Ms1BackendApplication.class, args);
    }

}
