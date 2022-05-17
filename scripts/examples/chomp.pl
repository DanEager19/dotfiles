#!/usr/bin/perl
require strict;

my $str = "junk\r\n";
chomp( $str );
print("[" . $str . "]");