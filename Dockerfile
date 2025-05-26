# Gunakan image Nginx sebagai base image
FROM nginx:alpine

# Set direktori kerja di dalam container
WORKDIR /usr/share/nginx/html

# Copy semua file dari folder frontend lokal ke folder html Nginx
COPY . .

# Expose port 80
EXPOSE 80