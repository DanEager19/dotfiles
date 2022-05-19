#!/usr/bin/perl
use strict;
use warnings;
use File::Find;

find( { wanted => \&findFiles, }, '/home/daniel/dotfiles' );

sub findFiles {
    my $filename = $File::Find::name;
    if ( $filename =~ /^.*\.sh.*$/ ) {
        searchFile($filename);
    }
}

sub searchFile {
    open( DATA, "<", @_ ) or die $!;

    while ( <DATA> ) {
        print "@_:$_" if $_ =~ /docker/;
    }
    close( DATA );
}